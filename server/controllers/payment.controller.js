import crypto from 'crypto';
import Item from '../models/Item.js';
import razorpay from '../utils/razorpayInstance.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── Platform fee percentage (10%) ───────────────────────────────────────────
const PLATFORM_FEE_RATE = 0.10;

// ─── @desc    Create a Razorpay order with platform fee ──────────────────────
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
    const finalAmount = basePrice + platformFee;

    // ── Create Razorpay order (amount in paise) ─────────────────────────────
    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100), // Convert ₹ → paise
        currency: 'INR',
        receipt: `receipt_${item._id}_${Date.now()}`,
        notes: {
            productId: item._id.toString(),
            basePrice: basePrice.toString(),
            platformFee: platformFee.toString(),
        },
    });

    res.status(201).json({
        success: true,
        orderId: razorpayOrder.id,
        finalAmount,
        breakdown: {
            basePrice,
            platformFee,
        },
    });
});

// ─── @desc    Verify Razorpay payment signature ─────────────────────────────
// ─── @route   POST /api/payment/verify ──────────────────────────────────────
// ─── @access  Private ───────────────────────────────────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        const error = new Error(
            'All fields are required: razorpay_order_id, razorpay_payment_id, razorpay_signature'
        );
        error.statusCode = 400;
        throw error;
    }

    // ── Construct expected signature ────────────────────────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    // ── Timing-safe comparison to prevent timing attacks ────────────────────
    const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
    );

    if (!isSignatureValid) {
        const error = new Error('Payment verification failed — invalid signature');
        error.statusCode = 400;
        throw error;
    }

    // ── Signature matches — payment is authentic ────────────────────────────
    res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
        },
    });
});
