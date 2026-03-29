import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';

const router = Router();

// All payment routes are protected
router.use(protect);

// POST /api/payment/create-order  — Create a Razorpay order with platform fee
router.post('/create-order', createOrder);

// POST /api/payment/verify        — Verify Razorpay payment signature
router.post('/verify', verifyPayment);

export default router;
