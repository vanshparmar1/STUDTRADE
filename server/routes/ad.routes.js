import { Router } from 'express';
const router = Router();
import { getActiveAds } from '../controllers/ad.controller.js';

// GET /api/ads - Public route to get active ads
router.get('/', getActiveAds);

export default router;
