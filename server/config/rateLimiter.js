import rateLimit from 'express-rate-limit';

// ─── General API Rate Limiter ─────────────────────────────────────────────────
// Applied globally to all routes. Generous limit for normal browsing.
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                  // 200 requests per window per IP
    standardHeaders: true,     // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});

// ─── Auth / Sensitive Route Rate Limiter ─────────────────────────────────────
// Applied to login, register, and KYC submission to mitigate brute force.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // 20 attempts per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please wait 15 minutes and try again.',
    },
});
