import { Router } from 'express';

import {
    register,
    login,
    getMe,
    verifyEmailOtp,
    resendEmailOtp,
    updateProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
    registerRules,
    loginRules,
    verifyEmailOtpRules,
    resendEmailOtpRules,
    updateProfileRules,
} from '../validators/auth.validators.js';
import { loginLimiter, otpVerifyLimiter, otpResendLimiter } from '../config/rateLimiter.js';

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
router.post('/register', validate(registerRules), register);
router.post('/login', loginLimiter, validate(loginRules), login);
router.post('/verify-email-otp', otpVerifyLimiter, validate(verifyEmailOtpRules), verifyEmailOtp);
router.post('/resend-email-otp', otpResendLimiter, validate(resendEmailOtpRules), resendEmailOtp);

// ─── Protected Routes ───────────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.patch('/profile', protect, validate(updateProfileRules), updateProfile);

export default router;