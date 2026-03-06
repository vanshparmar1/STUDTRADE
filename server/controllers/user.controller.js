import User from '../models/User.js';
import Item from '../models/Item.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Get public user profile ──────────────────────────────────────────
// ─── @route   GET /api/users/:id ───────────────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('name role createdAt');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

// ─── @desc    Get all active items for a user ─────────────────────────────────
// ─── @route   GET /api/users/:id/items ───────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getUserItems = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12 } = req.query;

    // ── Pagination Logic ─────────────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * perPage;

    const filter = { seller: req.params.id };

    // ── Execute query + count in parallel ────────────────────────────────────
    const [items, total] = await Promise.all([
        Item.find(filter)
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage),
        Item.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / perPage),
        data: items,
    });
});

// ─── @desc    Toggle save item (Add/Remove from wishlist) ─────────────────────
// ─── @route   PATCH /api/users/saved-items/:itemId ───────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
export const toggleSaveItem = asyncHandler(async (req, res) => {
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
        user.savedItems = user.savedItems.filter((id) => id.toString() !== itemId);
    } else {
        user.savedItems.push(itemId);
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: isSaved ? 'Item removed from saved items' : 'Item saved successfully',
        data: user.savedItems,
    });
});
