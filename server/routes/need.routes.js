import { Router } from 'express';
import {
    getAllNeeds,
    createNeed,
    markNeedFulfilled,
    deleteNeed,
} from '../controllers/need.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllNeeds);
router.post('/', protect, createNeed);
router.patch('/:id/fulfill', protect, markNeedFulfilled);
router.delete('/:id', protect, deleteNeed);

export default router;
