/**
 * Centralized Error Handling Middleware
 *
 * Must be the LAST middleware registered (after all routes).
 * Normalises known error types into a consistent JSON shape:
 *   { success: false, message: string, stack?: string }
 *
 * Handled error families:
 *  - Mongoose ValidationError   → 422
 *  - Mongoose CastError         → 400 (bad ObjectId, etc.)
 *  - Mongoose duplicate key     → 409
 *  - JsonWebTokenError          → 401
 *  - TokenExpiredError          → 401
 *  - Generic / unknown          → 500 (or err.statusCode if set)
 */

// ─── Normaliser helpers ───────────────────────────────────────────────────────

const handleValidationError = (err) => {
    // Collect every field-level message into a single readable string
    const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(', ');
    return { statusCode: 422, message };
};

const handleCastError = (err) => ({
    statusCode: 400,
    message: `Invalid value "${err.value}" for field "${err.path}".`,
});

const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    return {
        statusCode: 409,
        message: `Duplicate value: "${value}" already exists for ${field}.`,
    };
};

const handleJWTError = () => ({
    statusCode: 401,
    message: 'Invalid token. Please log in again.',
});

const handleJWTExpiredError = () => ({
    statusCode: 401,
    message: 'Your session has expired. Please log in again.',
});

// ─── Main middleware ──────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';

    // Start with a safe default
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // ── Mongoose: validation failed (schema rules, required fields, etc.) ──
    if (err.name === 'ValidationError') {
        ({ statusCode, message } = handleValidationError(err));
    }

    // ── Mongoose: bad ObjectId or wrong type cast ──
    else if (err.name === 'CastError') {
        ({ statusCode, message } = handleCastError(err));
    }

    // ── MongoDB: duplicate unique index violation ──
    else if (err.code === 11000) {
        ({ statusCode, message } = handleDuplicateKeyError(err));
    }

    // ── JWT: malformed or tampered token ──
    else if (err.name === 'JsonWebTokenError') {
        ({ statusCode, message } = handleJWTError());
    }

    // ── JWT: valid but expired token ──
    else if (err.name === 'TokenExpiredError') {
        ({ statusCode, message } = handleJWTExpiredError());
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(isDev && { stack: err.stack }),
    });
};
