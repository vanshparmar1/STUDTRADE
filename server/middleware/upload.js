import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// ─── Cloudinary storage engine ────────────────────────────────────────────────
const kycStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'studtrade/kyc',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        // Use the user's studtradeID as the public_id so files are easy to find/manage
        public_id: (_req, file) => {
            const name = file.originalname.replace(/\.[^/.]+$/, ''); // strip extension
            return `${Date.now()}-${name}`;
        },
    },
});

// ─── File filter — images only ────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, PNG, WEBP) are allowed'), false);
    }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
export const uploadKYC = multer({
    storage: kycStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
    },
});
