import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { validate } from '../middleware/validate.js';
import {
    createPaymentOrderRules,
    verifyPaymentRules,
} from '../validators/payment.validators.js';

const router = Router();

// All payment routes are protected
router.use(protect);

// POST /api/payment/create-order  — Create a Cashfree order with platform fee
router.post('/create-order', validate(createPaymentOrderRules), createOrder);

// POST /api/payment/verify        — Verify Cashfree payment status
router.post('/verify', validate(verifyPaymentRules), verifyPayment);

export default router;
