import { Router } from 'express';
import { reportItem } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// POST /api/reports - Report an item (authenticated users)
router.post('/', protect, reportItem);

export default router;
