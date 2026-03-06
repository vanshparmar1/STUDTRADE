import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Register a new user ───────────────────────────────────────────
// ─── @route   POST /api/auth/register ───────────────────────────────────────
// ─── @access  Public ────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // ── Check for duplicate email ─────────────────────────────────────────────
    // (field presence, format, and phone pattern are pre-validated by validate() middleware)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        const error = new Error('An account with this email already exists');
        error.statusCode = 409;
        throw error;
    }

    // ── 5. Create user ───────────────────────────────────────────────────────
    const user = await User.create({ name, email, password, phone });

    // ── 6. Issue JWT ─────────────────────────────────────────────────────────
    const token = generateToken(user._id);

    // ── 7. Return sanitized user + token ─────────────────────────────────────
    res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            role: user.role,
            savedItems: user.savedItems,
            createdAt: user.createdAt,
        },
    });
});

// ─── @desc    Login an existing user ────────────────────────────────────────
// ─── @route   POST /api/auth/login ──────────────────────────────────────────
// ─── @access  Public ────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // (required-field check handled by validate(loginRules) middleware)
    // Explicitly include password field (excluded by default via select:false)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            role: user.role,
            savedItems: user.savedItems,
        },
    });
});

// ─── @desc    Get current logged-in user ────────────────────────────────────
// ─── @route   GET /api/auth/me ──────────────────────────────────────────────
// ─── @access  Private (requires JWT via protect middleware) ─────────────────
export const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone ?? null,
            role: req.user.role,
            savedItems: req.user.savedItems,
            createdAt: req.user.createdAt,
        },
    });
});
