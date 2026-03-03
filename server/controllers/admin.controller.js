import User from '../models/User.js';
import Report from '../models/Report.js';


// ─── @desc    Get all reports ────────────────────────────────────────────────
// ─── @route   GET /api/admin/reports ────────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const getAllReports = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const reports = await Report.find(filter)
            .populate('item', 'title images')
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });
    } catch (err) {
        next(err);
    }
};

// ─── @desc    Review a report ────────────────────────────────────────────────
// ─── @route   PATCH /api/admin/reports/:id/review ────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const reviewReport = async (req, res, next) => {
    try {
        const { status, adminNote } = req.body;

        if (!['reviewed', 'dismissed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be reviewed or dismissed.',
            });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found',
            });
        }

        report.status = status;
        if (adminNote) report.adminNote = adminNote;

        await report.save();

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (err) {
        next(err);
    }
};

