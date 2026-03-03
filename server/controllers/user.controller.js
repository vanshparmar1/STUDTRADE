import User from '../models/User.js';
import Item from '../models/Item.js';

// ─── @desc    Get public user profile ──────────────────────────────────────────
// ─── @route   GET /api/users/:id ───────────────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getUserProfile = async (req, res, next) => {
    try {
        // Return only public-safe fields
        const user = await User.findById(req.params.id)
            .select('name role createdAt');

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
// ─── @desc    Toggle save item (Add/Remove from wishlist) ─────────────────────
// ─── @route   PATCH /api/users/saved-items/:itemId ───────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
export const toggleSaveItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const isSaved = user.savedItems.includes(itemId);

        if (isSaved) {
            // Remove if already saved
            user.savedItems = user.savedItems.filter(id => id.toString() !== itemId);
        } else {
            // Add if not present
            user.savedItems.push(itemId);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: isSaved ? 'Item removed from saved items' : 'Item saved successfully',
            data: user.savedItems
        });
    } catch (err) {
        next(err);
    }
};
