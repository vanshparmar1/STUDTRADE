import { Router } from 'express';
import { getUserProfile, getUserItems, toggleSaveItem } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
// Get public profile (name, account details, etc.)
router.get('/:id', getUserProfile);

// Get all items listed by a user
router.get('/:id/items', getUserItems);

// ─── Protected Routes ───────────────────────────────────────────────────────
// Toggle save item
router.patch('/saved-items/:itemId', protect, toggleSaveItem);

export default router;
