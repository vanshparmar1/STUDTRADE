import User from '../models/User.js';
import Item from '../models/Item.js';

// ─── @desc    Get public user profile ──────────────────────────────────────────
// ─── @route   GET /api/users/:id ───────────────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getUserProfile = async (req, res, next) => {
    try {
        // Return only public-safe fields
        const user = await User.findById(req.params.id)
            .select('name role verificationStatus studtradeID createdAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'User not found (invalid ID)'
            });
        }
        next(err);
    }
};

// ─── @desc    Get all active items for a user ─────────────────────────────────
// ─── @route   GET /api/users/:id/items ───────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getUserItems = async (req, res, next) => {
    try {
        // Find all items belonging to this user
        // We only show available items OR items they sold
        // But for a public profile, we generally show all
        const items = await Item.find({ seller: req.params.id })
            .select('-__v')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid User ID format'
            });
        }
        next(err);
    }
};
