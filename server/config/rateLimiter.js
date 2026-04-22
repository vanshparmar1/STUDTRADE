import rateLimit from 'express-rate-limit';

// ─── General API Rate Limiter ─────────────────────────────────────────────────
// Applied globally to all routes. Generous limit for normal browsing.
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                  // 200 requests per window per IP
    standardHeaders: true,     // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    // Never throttle CORS preflight — a 429 on OPTIONS surfaces as a browser "Network Error".
    skip: (req) => req.method === 'OPTIONS',
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
    skip: (req) => req.method === 'OPTIONS',
    message: {
        success: false,
        message: 'Too many attempts. Please wait 15 minutes and try again.',
    },
});

// ─── Item Creation Rate Limiter ──────────────────────────────────────────────
// Applied to item creation to prevent spam listings.
export const itemLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                   // 5 item creations per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'You have reached the maximum number of items (5) you can list in 15 minutes. Please try again later.',
    },
});

// ─── Login-specific Rate Limiter ──────────────────────────────────────────────
// Tighter than authLimiter — applied directly to POST /api/auth/login.
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.',
    },
});
