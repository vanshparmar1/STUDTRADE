import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect
 * Verifies the JWT from the Authorization header and attaches the
 * decoded user document to `req.user`.
 */
export const protect = async (req, res, next) => {
    let token;

    // Extract token from "Bearer <token>" header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        const error = new Error('Not authorised — no token provided');
        error.statusCode = 401;
        return next(error);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user (without password) to the request
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            const error = new Error('User belonging to this token no longer exists');
            error.statusCode = 401;
            return next(error);
        }

        next();
    } catch (err) {
        // jwt.verify throws JsonWebTokenError / TokenExpiredError
        // which the global errorHandler already normalises
        next(err);
    }
};

/**
 * authorizeRoles
 * Restricts access to users whose role is included in the allowed list.
 * Must be used AFTER `protect`.
 *
 * Usage: authorizeRoles('admin')  or  authorizeRoles('admin', 'moderator')
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            const error = new Error(
                `Role "${req.user.role}" is not authorised to access this route`
            );
            error.statusCode = 403;
            return next(error);
        }
        next();
    };
};
