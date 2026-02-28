/**
 * 404 Not Found Middleware
 * Catches any request that didn't match a registered route
 * and forwards a structured error to the global error handler.
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
