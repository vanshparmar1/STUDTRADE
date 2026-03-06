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

// ─── Multer instance — KYC (single doc, 2 MB) ────────────────────────────────
export const uploadKYC = multer({
    storage: kycStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
    },
});

// ─── Cloudinary storage — Item images ────────────────────────────────────────
const itemStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'studtrade/items',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: (_req, file) => {
            const name = file.originalname.replace(/\.[^/.]+$/, '');
            return `${Date.now()}-${name}`;
        },
    },
});

// ─── Multer instance — Item images (up to 5 files, 3 MB each) ────────────────
export const uploadItemImages = multer({
    storage: itemStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3 MB per file
        files: 5,                  // max 5 files per request
    },
});

// ─── Multer Error Wrapper ─────────────────────────────────────────────────────
/**
 * handleMulterError
 * Wraps a Multer middleware to catch MulterError and forward it
 * to the global error handler with a descriptive 400 status.
 */
export const handleMulterError = (multerMiddleware) => (req, res, next) => {
    multerMiddleware(req, res, (err) => {
        if (err) {
            err.statusCode = 400;
            if (err.code === 'LIMIT_FILE_SIZE') {
                err.message = 'File too large. Maximum size is 3 MB per image.';
            } else if (err.code === 'LIMIT_FILE_COUNT') {
                err.message = 'Too many files. Maximum is 5 images.';
            }
            return next(err);
        }
        next();
    });
};
