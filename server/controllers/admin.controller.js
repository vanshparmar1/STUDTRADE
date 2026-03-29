import Report from '../models/Report.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
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

// ─── @desc    Get all orders (admin) ─────────────────────────────────────────
// ─── @route   GET /api/admin/orders ──────────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * perPage;

    const [orders, total] = await Promise.all([
        Order.find()
            .populate('buyer', 'name email phone studtradeID')
            .populate('seller', 'name email phone studtradeID')
            .populate('item', 'title images price category condition')
            .sort('-createdAt')
            .skip(skip)
            .limit(perPage),
        Order.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        count: orders.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / perPage),
        data: orders,
    });
});

// ─── @desc    Update order status ────────────────────────────────────────────
// ─── @route   PATCH /api/admin/orders/:id ─────────────────────────────────────
// ─── @access  Private/Admin+Manager ──────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    // Allowlist — prevents operator injection and invalid values
    const VALID_TRANSITIONS = {
        pending:   'confirmed',
        confirmed: 'delivered',
    };
    const ALLOWED_STATUSES = Object.values(VALID_TRANSITIONS);

    if (!status || !ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
        });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Enforce transition chain: pending → confirmed → delivered
    const expectedCurrent = Object.keys(VALID_TRANSITIONS).find(
        (k) => VALID_TRANSITIONS[k] === status
    );
    if (order.status !== expectedCurrent) {
        return res.status(400).json({
            success: false,
            message: `Cannot move to "${status}" from "${order.status}". Expected current status: "${expectedCurrent}".`,
        });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: `Order status updated to "${status}"`,
        data: {
            _id: order._id,
            status: order.status,
            updatedAt: order.updatedAt,
        },
    });
});

// ─── @desc    Get platform dashboard stats ───────────────────────────────────
// ─── @route   GET /api/admin/dashboard ─────────────────────────────────────
// ─── @access  Private/Admin ───────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalOrders,
        totalUsers,
        totalItems,
        revenueResult,
    ] = await Promise.all([
        Order.countDocuments(),
        User.countDocuments(),
        Item.countDocuments(),
        Order.aggregate([
            { $group: { _id: null, totalCommission: { $sum: '$commission' } } },
        ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalCommission ?? 0;

    res.status(200).json({
        success: true,
        data: {
            totalOrders,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalUsers,
            totalItems,
        },
    });
});
