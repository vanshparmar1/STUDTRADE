import User from '../models/User.js';
import Counter from '../models/Counter.js';

// ─── Helper: get next STUDTRADE ID atomically ────────────────────────────────
const getNextStudtradeID = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: 'studtradeID' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return `ST-${counter.seq.toString().padStart(4, '0')}`;
};

// ─── @desc    Get all users with pending KYC ──────────────────────────────────
// ─── @route   GET /api/admin/pending-users ──────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const getPendingUsers = async (req, res, next) => {
    try {
        const users = await User.find({ verificationStatus: 'pending' })
            .select('-password')
            .sort({ createdAt: 1 }); // oldest first

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (err) {
        next(err);
    }
};

// ─── @desc    Approve a user's KYC ───────────────────────────────────────────
// ─── @route   PATCH /api/admin/approve/:userId ───────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const approveUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (user.verificationStatus === 'approved') {
            const error = new Error('This user is already approved');
            error.statusCode = 400;
            throw error;
        }

        user.verificationStatus = 'approved';
        user.isVerified = true;
        user.verifiedAt = new Date();
        user.verifiedBy = req.user._id;

        // Assign STUDTRADE ID if not already present
        if (!user.studtradeID) {
            user.studtradeID = await getNextStudtradeID();
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User approved successfully',
            data: {
                id: user._id,
                studtradeID: user.studtradeID,
                verificationStatus: user.verificationStatus,
                isVerified: user.isVerified,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── @desc    Reject a user's KYC ────────────────────────────────────────────
// ─── @route   PATCH /api/admin/reject/:userId ────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const rejectUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (user.verificationStatus === 'approved') {
            const error = new Error('Cannot reject an already approved user');
            error.statusCode = 400;
            throw error;
        }

        user.verificationStatus = 'rejected';
        user.isVerified = false;
        user.verifiedAt = new Date();
        user.verifiedBy = req.user._id;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User rejected successfully',
            data: {
                id: user._id,
                verificationStatus: user.verificationStatus,
                isVerified: user.isVerified,
            },
        });
    } catch (err) {
        next(err);
    }
};

