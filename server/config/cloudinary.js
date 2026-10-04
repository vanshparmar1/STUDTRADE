import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration
 * Reads credentials from environment variables.
 * Call this once during app bootstrap.
 */
const configureCloudinary = () => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        console.warn(
            '⚠️ Missing or incomplete Cloudinary credentials in .env. Image uploads will use local storage fallback.'
        );
        return cloudinary;
    }

    try {
        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
            secure: true, // always use HTTPS URLs
        });
    } catch (err) {
        console.warn('⚠️ Cloudinary configuration warning:', err.message);
    }

    return cloudinary;
};

// Configure on import and export the ready-to-use instance
const cloudinaryInstance = configureCloudinary();

export default cloudinaryInstance;

