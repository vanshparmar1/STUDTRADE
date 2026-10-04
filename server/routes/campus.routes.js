import { Router } from 'express';
import {
    getAllCampusUpdates,
    createCampusUpdate,
    deleteCampusUpdate,
} from '../controllers/campus.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllCampusUpdates);
router.post('/', protect, createCampusUpdate);
router.delete('/:id', protect, deleteCampusUpdate);

export default router;
