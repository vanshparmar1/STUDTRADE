import crypto from 'crypto';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import Item from '../models/Item.js';
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

    // ── Calculate pricing server-side ───────────────────────────────────────
    const basePrice = item.price;
    const platformFee = Math.round(basePrice * PLATFORM_FEE_RATE * 100) / 100;
    const finalAmount = Math.round((basePrice + platformFee) * 100) / 100;

    // ── Generate a unique order ID ─────────────────────────────────────────
    const orderId = `order_${item._id.toString().slice(-6)}_${Date.now()}`;

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

    // ── Fetch payment status from Cashfree server-side ──────────────────────
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data;

    if (!payments || payments.length === 0) {
        const error = new Error('No payments found for this order');
        error.statusCode = 400;
        throw error;
    }

    // Find the successful payment
    const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS');

    if (!successfulPayment) {
        const error = new Error('Payment not completed or failed');
        error.statusCode = 400;
        throw error;
    }

    // ── Payment is verified ─────────────────────────────────────────────────
    res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
            orderId: orderId,
            paymentId: successfulPayment.cf_payment_id?.toString(),
            paymentAmount: successfulPayment.payment_amount,
            paymentMethod: successfulPayment.payment_group,
        },
    });
});
