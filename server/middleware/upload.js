import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local upload directories exist
const itemsUploadDir = path.join(__dirname, '../uploads/items');
const kycUploadDir = path.join(__dirname, '../uploads/kyc');
const studyUploadDir = path.join(__dirname, '../uploads/study');

if (!fs.existsSync(itemsUploadDir)) {
    fs.mkdirSync(itemsUploadDir, { recursive: true });
}
if (!fs.existsSync(kycUploadDir)) {
    fs.mkdirSync(kycUploadDir, { recursive: true });
}
if (!fs.existsSync(studyUploadDir)) {
    fs.mkdirSync(studyUploadDir, { recursive: true });
}

// ─── Resilient Cloudinary Storage Engine (with Local Storage Fallback) ───────
function ResilientCloudinaryStorage({ folder }) {
    this.folder = folder;
}

ResilientCloudinaryStorage.prototype._handleFile = function (req, file, cb) {
    const subFolder = this.folder.includes('kyc')
        ? 'kyc'
        : this.folder.includes('study')
        ? 'study'
        : 'items';

    const targetDir = path.join(__dirname, `../uploads/${subFolder}`);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const sanitizedOriginalName = (file.originalname || 'document').replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedOriginalName}`;
    const localFilePath = path.join(targetDir, filename);
    const relativeWebPath = `/uploads/${subFolder}/${filename}`;

    const outStream = fs.createWriteStream(localFilePath);

    file.stream.pipe(outStream);

    outStream.on('error', (err) => {
        cb(err);
    });

    outStream.on('finish', async () => {
        // First try Cloudinary upload with resource_type auto for docs/PDFs
        try {
            const cloudinaryResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    localFilePath,
                    { folder: this.folder, resource_type: 'auto' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
            });

            if (cloudinaryResult && cloudinaryResult.secure_url) {
                // Cloudinary upload succeeded — delete local temp copy and return secure URL
                try {
                    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
                } catch (_) {}
                return cb(null, {
                    path: cloudinaryResult.secure_url,
                    filename: cloudinaryResult.public_id,
                    size: cloudinaryResult.bytes,
                });
            }
        } catch (cloudErr) {
            console.warn(
                `⚠️ Cloudinary upload skipped/failed (${cloudErr.message || 'HTTP 403'}). Using persistent Data URI / local storage fallback.`
            );
        }

        // Persistent Data URI / Local storage fallback if Cloudinary failed or bypassed
        try {
            const stat = fs.statSync(localFilePath);
            let finalPath = relativeWebPath;

            // For files under 10MB, generate a Data URI so the file content persists directly in DB across deployments
            if (stat.size <= 10 * 1024 * 1024) {
                const buffer = fs.readFileSync(localFilePath);
                const mimeType = file.mimetype || (
                    (file.originalname || '').endsWith('.pdf') ? 'application/pdf' :
                    (file.originalname || '').match(/\.(jpg|jpeg)$/i) ? 'image/jpeg' :
                    (file.originalname || '').endsWith('.png') ? 'image/png' :
                    (file.originalname || '').endsWith('.webp') ? 'image/webp' :
                    'application/octet-stream'
                );
                finalPath = `data:${mimeType};base64,${buffer.toString('base64')}`;
            }

            cb(null, {
                path: finalPath,
                filename: filename,
                size: stat.size,
            });
        } catch (err) {
            cb(err);
        }
    });
};

ResilientCloudinaryStorage.prototype._removeFile = function (req, file, cb) {
    if (file.path && file.path.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '..', file.path);
        try {
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        } catch (_) {}
    }
    cb(null);
};

// ─── File filter — images only ────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, PNG, WEBP) are allowed'), false);
    }
};

// ─── File filter — documents & study materials ────────────────────────────────
const studyFilter = (_req, file, cb) => {
    const isAllowedExt = /\.(pdf|doc|docx|ppt|pptx|txt|zip|jpg|jpeg|png|webp)$/i.test(file.originalname || '');
    if (file.mimetype || isAllowedExt) {
        cb(null, true);
    } else {
        cb(new Error('Only document files (PDF, DOC, PPT, TXT, ZIP) or images are allowed'), false);
    }
};

// ─── Multer instances ────────────────────────────────────────────────────────
export const uploadKYC = multer({
    storage: new ResilientCloudinaryStorage({ folder: 'studtrade/kyc' }),
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
    },
});

export const uploadItemImages = multer({
    storage: new ResilientCloudinaryStorage({ folder: 'studtrade/items' }),
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per file
        files: 5,                  // max 5 files per request
    },
});

export const uploadStudyMaterialFiles = multer({
    storage: new ResilientCloudinaryStorage({ folder: 'studtrade/study' }),
    fileFilter: studyFilter,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB per file
        files: 5,
    },
});

// ─── Multer Error Wrapper ─────────────────────────────────────────────────────
export const handleMulterError = (multerMiddleware) => (req, res, next) => {
    multerMiddleware(req, res, (err) => {
        if (err) {
            err.statusCode = 400;
            if (err.code === 'LIMIT_FILE_SIZE') {
                err.message = 'File too large. Maximum size is 15 MB per file.';
            } else if (err.code === 'LIMIT_FILE_COUNT') {
                err.message = 'Too many files. Maximum is 5 files.';
            }
            return next(err);
        }
        next();
    });
};
