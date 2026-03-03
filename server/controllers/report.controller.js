import Report from '../models/Report.js';
import Item from '../models/Item.js';

// ─── @desc    Create a new report for an item ───────────────────────────────
// ─── @route   POST /api/reports ─────────────────────────────────────────────
// ─── @access  Private (Any logged-in user) ──────────────────────────────────
export const reportItem = async (req, res, next) => {
    try {
        const { item: itemId, reason } = req.body;

        if (!itemId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Item ID and reason are required',
            });
        }

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

        // Duplicate check is handled by the unique index on { item, reportedBy }
        // but we can provide a better error message by catching it or checking explicitly.
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
    } catch (err) {
        // Special handling for MongoDB duplicate key error (if race condition occurs)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this item',
            });
        }
        next(err);
    }
};
