import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { uploadItemImages, handleMulterError } from '../middleware/upload.js';
import {
    getActivePromotions,
    getAdminPromotions,
    createPromotion,
    updatePromotion,
    togglePromotionStatus,
    deletePromotion,
} from '../controllers/promotion.controller.js';

const router = express.Router();

// Public route for landing page / carousel
router.get('/active', getActivePromotions);

// Protected Admin Routes (requires logged-in user with admin/manager role)
router.use(protect);
router.use(authorizeRoles('admin', 'manager'));

router.get('/admin', getAdminPromotions);
router.post('/', handleMulterError(uploadItemImages.single('image')), createPromotion);
router.put('/:id', handleMulterError(uploadItemImages.single('image')), updatePromotion);
router.patch('/:id/status', togglePromotionStatus);
router.delete('/:id', deletePromotion);

export default router;
