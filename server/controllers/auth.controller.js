import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendOtpEmail from '../utils/sendOtpEmail.js';

// helper function
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


// ─── @desc    Register a new user and send email OTP ────────────────────────
// ─── @route   POST /api/auth/register ───────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    console.log("1. Register started:", email);

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        const error = new Error('An account with this email already exists');
        error.statusCode = 409;
        throw error;
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        isEmailVerified: false,
    });
    console.log("2. User created");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.emailOtp = hashedOtp;
    user.emailOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    console.log("3. OTP saved");

    try {
        console.log("4. Sending OTP email...");
        await sendOtpEmail(user.email, otp);
        console.log("5. OTP email sent");
    } catch (mailError) {
        console.error("MAIL ERROR:", mailError);
        const error = new Error("User created, but OTP email could not be sent");
        error.statusCode = 500;
        throw error;
    }

    res.status(201).json({
        success: true,
        message: 'Registration successful. OTP sent to your email',
        email: user.email,
    });
});

// ─── @desc    Verify email OTP ──────────────────────────────────────────────
// ─── @route   POST /api/auth/verify-email-otp ───────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const verifyEmailOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })
        .select('+emailOtp +emailOtpExpires +emailOtpAttempts');

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (user.isEmailVerified) {
        const error = new Error('Email is already verified');
        error.statusCode = 400;
        throw error;
    }

    if (!user.emailOtp || !user.emailOtpExpires) {
        const error = new Error('No OTP found. Please request a new one');
        error.statusCode = 400;
        throw error;
    }

    if (user.emailOtpExpires < new Date()) {
        const error = new Error('OTP has expired');
        error.statusCode = 400;
        throw error;
    }

    user.emailOtpAttempts += 1;

    if (user.emailOtpAttempts > 5) {
        const error = new Error('Too many attempts. Please request a new OTP');
        error.statusCode = 429;
        throw error;
    }

    const isOtpValid = await bcrypt.compare(otp.trim(), user.emailOtp);

    if (!isOtpValid) {
        await user.save();
        const error = new Error('Invalid OTP');
        error.statusCode = 400;
        throw error;
    }

    user.isEmailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpires = null;
    user.emailOtpAttempts = 0;

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Email verified successfully',
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


// ─── @desc    Resend email OTP ──────────────────────────────────────────────
// ─── @route   POST /api/auth/resend-email-otp ───────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const resendEmailOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (user.isEmailVerified) {
        const error = new Error('Email is already verified');
        error.statusCode = 400;
        throw error;
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.emailOtp = hashedOtp;
    user.emailOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.status(200).json({
        success: true,
        message: 'OTP resent successfully',
    });
});

// ─── @desc    Login an existing user ────────────────────────────────────────
// ─── @route   POST /api/auth/login ──────────────────────────────────────────
// ─── @access  Public ────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    if (!user.isEmailVerified) {
        const error = new Error('Please verify your email before logging in');
        error.statusCode = 403;
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
// ─── @access  Private ───────────────────────────────────────────────────────
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