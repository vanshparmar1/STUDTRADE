import { Router } from 'express';
import {
    getAllStudyMaterials,
    createStudyMaterial,
    deleteStudyMaterial,
    incrementStudyView,
    incrementStudyDownload,
} from '../controllers/study.controller.js';
import { protect } from '../middleware/auth.js';
import { uploadStudyMaterialFiles, handleMulterError } from '../middleware/upload.js';

const router = Router();

router.get('/', getAllStudyMaterials);
router.post(
    '/',
    protect,
    handleMulterError(uploadStudyMaterialFiles.array('files', 5)),
    createStudyMaterial
);
router.delete('/:id', protect, deleteStudyMaterial);
router.post('/:id/view', incrementStudyView);
router.post('/:id/download', incrementStudyDownload);

export default router;
