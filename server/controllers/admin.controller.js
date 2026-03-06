import Report from '../models/Report.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Get all reports ────────────────────────────────────────────────
// ─── @route   GET /api/admin/reports ────────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const getAllReports = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 12 } = req.query;

    // Allowlist status to prevent operator injection
    const VALID_STATUSES = ['pending', 'reviewed', 'dismissed'];
    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
    }

    // ── Pagination Logic ─────────────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * perPage;

    const filter = status ? { status } : {};

    // ── Execute query + count in parallel ────────────────────────────────────
    const [reports, total] = await Promise.all([
        Report.find(filter)
            .populate('item', 'title images')
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage),
        Report.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        count: reports.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / perPage),
        data: reports,
    });
});

// ─── @desc    Review a report ────────────────────────────────────────────────
// ─── @route   PATCH /api/admin/reports/:id/review ────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const reviewReport = asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body;

    if (!['reviewed', 'dismissed'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be "reviewed" or "dismissed".',
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
});
