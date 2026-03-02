import rateLimit from 'express-rate-limit';

/**
 * loginLimiter
 * Limits repeated login attempts from the same IP address.
 * 5 requests per 15-minute window.
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,    // Return rate-limit info in `RateLimit-*` headers
    legacyHeaders: false,     // Disable `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.',
    },
});
