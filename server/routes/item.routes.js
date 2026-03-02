import {
    createItem,
    getAllItems,
    getItem,
    updateItem,
    markAsSold
} from '../controllers/item.controller.js';
import { protect, requireVerifiedUser } from '../middleware/auth.js';
import { uploadItemImages } from '../middleware/upload.js';

import { Router } from 'express';

const router = Router();

// GET /api/items — public; supports filters
router.get('/', getAllItems);

// GET /api/items/:id — public
router.get('/:id', getItem);

// POST /api/items — verified users only; accepts up to 5 images in 'images' field
router.post(
    '/',
    protect,
    requireVerifiedUser,
    uploadItemImages.array('images', 5),
    createItem
);

// PUT /api/items/:id — verified owners or admin only
router.put('/:id', protect, requireVerifiedUser, updateItem);

// PATCH /api/items/:id/sold — verified owners only
router.patch('/:id/sold', protect, requireVerifiedUser, markAsSold);

export default router;
