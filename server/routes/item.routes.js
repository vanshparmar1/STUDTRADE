import { Router } from 'express';
import {
    createItem,
    getAllItems,
    getSingleItem,
    updateItem,
    markAsSold,
} from '../controllers/item.controller.js';
import { protect } from '../middleware/auth.js';
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
    itemLimiter,
    handleMulterError(uploadItemImages.array('images', 5)),
    validate(createItemRules),
    createItem
);

// PUT /api/items/:id — owners or admin only
router.put('/:id', protect, updateItem);

// PATCH /api/items/:id/sold — owners only
router.patch('/:id/sold', protect, markAsSold);

export default router;
