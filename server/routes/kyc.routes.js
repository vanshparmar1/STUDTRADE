import { Router } from 'express';
import { submitKYC } from '../controllers/kyc.controller.js';
import { protect } from '../middleware/auth.js';
import { uploadKYC } from '../middleware/upload.js';

const router = Router();

// POST /api/kyc/submit — authenticated user uploads their KYC document
// Chain: protect (JWT) → uploadKYC (multer + Cloudinary) → submitKYC (controller)
router.post('/submit', protect, uploadKYC.single('document'), submitKYC);

export default router;
