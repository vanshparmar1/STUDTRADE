import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration
 * Reads credentials from environment variables.
 * Call this once during app bootstrap (before handling uploads).
 */
const configureCloudinary = () => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error(
            'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env'
        );
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true, // always use HTTPS URLs
    });

    return cloudinary;
};

// Configure on import and export the ready-to-use instance
const cloudinaryInstance = configureCloudinary();

export default cloudinaryInstance;
