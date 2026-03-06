import { Router } from 'express';
import { reportItem } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reportItemRules } from '../validators/item.validators.js';

const router = Router();

// POST /api/reports — authenticated users only
router.post('/', protect, validate(reportItemRules), reportItem);

export default router;
