import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendOtpEmail from '../utils/sendOtpEmail.js';
import {
    ALLOWED_EMAIL_DOMAIN,
    isAllowedCollegeEmail,
    normalizeEmail,
} from '../utils/emailDomain.js';

// helper function
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/** Shape returned to the client for the logged-in user (login, verify, /me, PATCH profile). */
const toPublicUser = (user) => ({
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    studtradeID: user.studtradeID ?? null,
    isEmailVerified: Boolean(user.isEmailVerified),
    address: {
        fullAddress: user.address?.fullAddress ?? '',
        city: user.address?.city ?? '',
        pincode: user.address?.pincode ?? '',
        landmark: user.address?.landmark ?? '',
    },
    savedItems: user.savedItems,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// ─── @desc    Register a new user and send email OTP ────────────────────────
// ─── @route   POST /api/auth/register ───────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedCollegeEmail(normalizedEmail)) {
        const error = new Error(
            `Only @${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`
        );
        error.statusCode = 400;
        throw error;
    }

    console.log("1. Register started:", normalizedEmail);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(200).json({
            success: true,
            message: 'If this email is eligible, registration instructions have been sent',
            email: normalizedEmail,
        });
    }

    const user = await User.create({
        name,
        email: normalizedEmail,
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
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail })
        .select('+emailOtp +emailOtpExpires +emailOtpAttempts');

    if (!user) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 404;
        throw error;
    }

    if (user.isEmailVerified) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 400;
        throw error;
    }

    if (!user.emailOtp || !user.emailOtpExpires) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 400;
        throw error;
    }

    if (user.emailOtpExpires < new Date()) {
        const error = new Error('Invalid or expired OTP');
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
        const error = new Error('Invalid or expired OTP');
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
        user: toPublicUser(user),
    });
});


// ─── @desc    Resend email OTP ──────────────────────────────────────────────
// ─── @route   POST /api/auth/resend-email-otp ───────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const resendEmailOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.isEmailVerified) {
        return res.status(200).json({
            success: true,
            message: 'If this account is eligible, OTP has been sent',
        });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.emailOtp = hashedOtp;
    user.emailOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.status(200).json({
        success: true,
        message: 'If this account is eligible, OTP has been sent',
    });
});

// ─── @desc    Login an existing user ────────────────────────────────────────
// ─── @route   POST /api/auth/login ──────────────────────────────────────────
// ─── @access  Public ────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    if (!isAllowedCollegeEmail(user.email)) {
        const error = new Error(
            `Access restricted to @${ALLOWED_EMAIL_DOMAIN} accounts only`
        );
        error.statusCode = 403;
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
        user: toPublicUser(user),
    });
});

// ─── @desc    Get current logged-in user ────────────────────────────────────
// ─── @route   GET /api/auth/me ──────────────────────────────────────────────
// ─── @access  Private ───────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: toPublicUser(req.user),
    });
});

// ─── @desc    Update current user profile ───────────────────────────────────
// ─── @route   PATCH /api/auth/profile ──────────────────────────────────────
// ─── @access  Private ───────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address, currentPassword, newPassword } = req.body;

    const wantsPasswordChange =
        newPassword !== undefined &&
        newPassword !== null &&
        String(newPassword).trim() !== '';

    const user = await User.findById(req.user._id).select(wantsPasswordChange ? '+password' : '');

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (name !== undefined) {
        user.name = String(name).trim();
    }

    if (phone !== undefined) {
        const p = phone === null || phone === undefined ? '' : String(phone).trim();
        user.phone = p === '' ? null : p;
    }

    if (address !== undefined && address !== null && typeof address === 'object') {
        if (!user.address) user.address = {};
        const allowed = ['fullAddress', 'city', 'pincode', 'landmark'];
        for (const key of allowed) {
            if (address[key] !== undefined) {
                const v = address[key] === null ? '' : String(address[key]).trim();
                user.address[key] = v;
            }
        }
        const pc = user.address.pincode;
        if (pc && !/^\d{6}$/.test(pc)) {
            const error = new Error('Pincode must be a 6-digit number');
            error.statusCode = 400;
            throw error;
        }
    }

    if (wantsPasswordChange) {
        const pwd = String(newPassword).trim();
        const current =
            currentPassword === undefined || currentPassword === null
                ? ''
                : String(currentPassword);
        if (!current) {
            const error = new Error('Current password is required to set a new password');
            error.statusCode = 400;
            throw error;
        }
        if (!(await user.matchPassword(current))) {
            const error = new Error('Current password is incorrect');
            error.statusCode = 400;
            throw error;
        }
        user.password = pwd;
    }

    await user.save();
    const fresh = await User.findById(req.user._id);
    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: toPublicUser(fresh),
    });
});