import { Router } from 'express';
import {
    createItem,
    getAllItems,
    getSingleItem,
    updateItem,
    markAsSold,
    deleteItem,
    toggleLikeItem,
    addCommentItem,
} from '../controllers/item.controller.js';
import { protect, requireCollegeEmail } from '../middleware/auth.js';
import { uploadItemImages, handleMulterError } from '../middleware/upload.js';
import { itemLimiter } from '../config/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { createItemRules } from '../validators/item.validators.js';

const router = Router();

// GET /api/items — public; supports filters
router.get('/', getAllItems);

// GET /api/items/:id — public
router.get('/:id', getSingleItem);

// POST /api/items — authenticated; upload images (parses multipart body) → validate → create
router.post(
    '/',
    protect,
    requireCollegeEmail,
    itemLimiter,
    handleMulterError(uploadItemImages.array('images', 5)),
    validate(createItemRules),
    createItem
);

// POST /api/items/:id/like — authenticated
router.post('/:id/like', protect, toggleLikeItem);

// POST /api/items/:id/comment — authenticated
router.post('/:id/comment', protect, addCommentItem);

// PUT /api/items/:id — owners or admin only
router.put('/:id', protect, requireCollegeEmail, updateItem);

// PATCH /api/items/:id/sold — owners only
router.patch('/:id/sold', protect, requireCollegeEmail, markAsSold);

// DELETE /api/items/:id — owners or admin only
router.delete('/:id', protect, deleteItem);

export default router;

