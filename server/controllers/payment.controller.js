import crypto from 'crypto';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import Item from '../models/Item.js';
import PaymentIntent from '../models/PaymentIntent.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── Configure Cashfree SDK ─────────────────────────────────────────────────
const cfEnvironment = process.env.NODE_ENV === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

const cashfree = new Cashfree(
    cfEnvironment,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);

// ─── Platform fee percentage (10%) ───────────────────────────────────────────
const PLATFORM_FEE_RATE = 0.10;
const PAYMENT_INTENT_TTL_MS = 20 * 60 * 1000;

// ─── @desc    Create a Cashfree order with platform fee ──────────────────────
// ─── @route   POST /api/payment/create-order ─────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        const error = new Error('productId is required');
        error.statusCode = 400;
        throw error;
    }

    // ── Fetch product from DB — never trust frontend for price ──────────────
    const item = await Item.findById(productId);
    if (!item) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    if (item.status !== 'available') {
        const error = new Error('This product is no longer available');
        error.statusCode = 400;
        throw error;
    }

    if (item.seller.toString() === req.user._id.toString()) {
        const error = new Error('You cannot buy your own listing');
        error.statusCode = 400;
        throw error;
    }

    // ── Calculate pricing server-side ───────────────────────────────────────
    const basePrice = item.price;
    const platformFee = Math.round(basePrice * PLATFORM_FEE_RATE * 100) / 100;
    const finalAmount = Math.round((basePrice + platformFee) * 100) / 100;

    // ── Generate a unique order ID ─────────────────────────────────────────
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`;

    // ── Create Cashfree order (amount in INR, not paise) ────────────────────
    const orderRequest = {
        order_amount: finalAmount,
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
            customer_id: req.user._id.toString(),
            customer_phone: req.user.phone || '9999999999',
            customer_email: req.user.email,
            customer_name: req.user.name,
        },
        order_meta: {
            notify_url: null, // We'll verify via API call instead of webhook for now
        },
        order_note: `Purchase: ${item.title}`,
    };

    const response = await cashfree.PGCreateOrder(orderRequest);
    const cfOrder = response.data;

    await PaymentIntent.create({
        cashfreeOrderId: cfOrder.order_id,
        buyer: req.user._id,
        item: item._id,
        seller: item.seller,
        expectedAmount: finalAmount,
        currency: 'INR',
        status: 'created',
        expiresAt: new Date(Date.now() + PAYMENT_INTENT_TTL_MS),
    });

    res.status(201).json({
        success: true,
        orderId: cfOrder.order_id,
        cfOrderId: cfOrder.cf_order_id,
        paymentSessionId: cfOrder.payment_session_id,
        finalAmount,
        breakdown: {
            basePrice,
            platformFee,
        },
    });
});

// ─── @desc    Verify Cashfree payment status ────────────────────────────────
// ─── @route   POST /api/payment/verify ──────────────────────────────────────
// ─── @access  Private ───────────────────────────────────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        const error = new Error('orderId is required');
        error.statusCode = 400;
        throw error;
    }

    const intent = await PaymentIntent.findOne({
        cashfreeOrderId: String(orderId).trim(),
        buyer: req.user._id,
    })
        .populate('item', 'status')
        .select('+item');

    if (!intent) {
        const error = new Error('Payment session not found for this account');
        error.statusCode = 404;
        throw error;
    }

    if (intent.status === 'paid') {
        return res.status(200).json({
            success: true,
            message: 'Payment already verified',
            data: {
                orderId: intent.cashfreeOrderId,
                paymentId: intent.cashfreePaymentId,
                paymentAmount: intent.expectedAmount,
                paymentMethod: 'ONLINE',
            },
        });
    }

    if (intent.expiresAt < new Date()) {
        intent.status = 'expired';
        await intent.save();
        const error = new Error('Payment session expired. Please retry checkout.');
        error.statusCode = 400;
        throw error;
    }

    if (!intent.item || intent.item.status !== 'available') {
        const error = new Error('Item is no longer available for checkout');
        error.statusCode = 409;
        throw error;
    }

    // ── Fetch payment status from Cashfree server-side ──────────────────────
    const response = await cashfree.PGOrderFetchPayments(intent.cashfreeOrderId);
    const payments = response.data;

    if (!payments || payments.length === 0) {
        const error = new Error('No payments found for this order');
        error.statusCode = 400;
        throw error;
    }

    // Find successful payment matching our expected amount/currency.
    const successfulPayment = payments.find((p) => {
        const amountMatches = Number(p.payment_amount) === Number(intent.expectedAmount);
        const currencyMatches = (p.payment_currency || intent.currency) === intent.currency;
        return p.payment_status === 'SUCCESS' && amountMatches && currencyMatches;
    });

    if (!successfulPayment) {
        const error = new Error('Payment not completed or failed');
        error.statusCode = 400;
        throw error;
    }

    // ── Mark intent paid (idempotent) and then sell the item ─────────────────
    const updatedIntent = await PaymentIntent.findOneAndUpdate(
        { _id: intent._id, status: { $ne: 'paid' } },
        {
            status: 'paid',
            cashfreePaymentId: successfulPayment.cf_payment_id?.toString() || null,
            paidAt: new Date(),
        },
        { new: true }
    );

    const finalIntent = updatedIntent || intent;

    const soldResult = await Item.updateOne(
        { _id: intent.item._id, status: 'available' },
        { $set: { status: 'sold' } }
    );

    if (soldResult.modifiedCount === 0) {
        const error = new Error('Payment captured, but item is no longer available. Contact support.');
        error.statusCode = 409;
        throw error;
    }

    res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
            orderId: finalIntent.cashfreeOrderId,
            paymentId: finalIntent.cashfreePaymentId,
            paymentAmount: finalIntent.expectedAmount,
            paymentMethod: successfulPayment.payment_group,
        },
    });
});
