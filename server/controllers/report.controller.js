import Report from '../models/Report.js';
import Item from '../models/Item.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Create a new report for an item ───────────────────────────────
// ─── @route   POST /api/reports ─────────────────────────────────────────────
// ─── @access  Private (Any logged-in user) ──────────────────────────────────
export const reportItem = asyncHandler(async (req, res) => {
    const { item: itemId, reason } = req.body;

    // (presence and length of itemId/reason pre-validated by validate(reportItemRules) middleware)

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found',
        });
    }

    // Prevent reporting own item
    if (item.seller.toString() === req.user.id) {
        return res.status(400).json({
            success: false,
            message: 'You cannot report your own item',
        });
    }

    // Explicit duplicate check for a better error message before hitting the DB index
    const existingReport = await Report.findOne({
        item: itemId,
        reportedBy: req.user.id,
    });

    if (existingReport) {
        return res.status(400).json({
            success: false,
            message: 'You have already reported this item',
        });
    }

    const report = await Report.create({
        item: itemId,
        reportedBy: req.user.id,
        reason,
    });

    res.status(201).json({
        success: true,
        data: report,
    });
    // Note: MongoDB duplicate-key error (code 11000) from a race condition
    // is handled by the global errorHandler, which returns a 409 with a
    // descriptive message — no need for a local catch block.
});
