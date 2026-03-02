import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', loginLimiter, login);

// ─── Protected Routes ───────────────────────────────────────────────────────
router.get('/me', protect, getMe);

export default router;
