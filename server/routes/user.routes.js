import { Router } from 'express';
import { getUserProfile, getUserItems } from '../controllers/user.controller.js';

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
// Get public profile (name, verified status, etc.)
router.get('/:id', getUserProfile);

// Get all items listed by a user
router.get('/:id/items', getUserItems);

export default router;
