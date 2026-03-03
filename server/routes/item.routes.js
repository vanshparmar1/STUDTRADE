import {
    createItem,
    getAllItems,
    getSingleItem,
    updateItem,
    markAsSold
} from '../controllers/item.controller.js';
import { protect } from '../middleware/auth.js';
import { uploadItemImages } from '../middleware/upload.js';
import { itemLimiter } from '../config/rateLimiter.js';

import { Router } from 'express';

const router = Router();

// GET /api/items — public; supports filters
router.get('/', getAllItems);

// GET /api/items/:id — public
router.get('/:id', getSingleItem);

// POST /api/items — authenticated users only; accepts up to 5 images in 'images' field
router.post(
    '/',
    protect,
    itemLimiter,
    uploadItemImages.array('images', 5),
    createItem
);

// PUT /api/items/:id — owners or admin only
router.put('/:id', protect, updateItem);

// PATCH /api/items/:id/sold — owners only
router.patch('/:id/sold', protect, markAsSold);

export default router;
