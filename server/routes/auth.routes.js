import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerRules, loginRules } from '../validators/auth.validators.js';
import { loginLimiter } from '../config/rateLimiter.js';

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
router.post('/register', validate(registerRules), register);
router.post('/login', loginLimiter, validate(loginRules), login);

// ─── Protected Routes ───────────────────────────────────────────────────────
router.get('/me', protect, getMe);

export default router;
