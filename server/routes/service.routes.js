import { Router } from 'express';
import {
    getAllServices,
    createService,
    deleteService,
    requestProviderService,
} from '../controllers/service.controller.js';
import { protect } from '../middleware/auth.js';
import { uploadItemImages, handleMulterError } from '../middleware/upload.js';

const router = Router();

router.get('/', getAllServices);
router.post(
    '/',
    protect,
    handleMulterError(uploadItemImages.array('images', 5)),
    createService
);
router.post('/request', requestProviderService);
router.delete('/:id', protect, deleteService);

export default router;
