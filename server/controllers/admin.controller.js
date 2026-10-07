import Report from '../models/Report.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Need from '../models/Need.js';
import Study from '../models/Study.js';
import CampusUpdate from '../models/CampusUpdate.js';
import Service from '../models/Service.js';
import Provider from '../models/Provider.js';
import ProviderService from '../models/ProviderService.js';
import Customer from '../models/Customer.js';
import ProviderNotification from '../models/ProviderNotification.js';
import Promotion from '../models/Promotion.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Get all reports ────────────────────────────────────────────────
// ─── @route   GET /api/admin/reports ────────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const getAllReports = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 12 } = req.query;

    const VALID_STATUSES = ['pending', 'reviewed', 'dismissed'];
    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * perPage;

    const filter = status ? { status } : {};

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

// ─── @desc    Get all platform orders (admin) ────────────────────────────────
// ─── @route   GET /api/admin/orders ──────────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate('buyer', 'name email phone studtradeID')
        .populate('seller', 'name email phone studtradeID')
        .populate('item', 'title images price category condition pickupAddress')
        .sort('-createdAt');

    const formattedOrders = orders.map((o) => ({
        _id: o._id,
        type: 'Marketplace Purchase',
        itemName: o.item?.title || 'N/A',
        buyerName: o.buyer?.name || o.deliveryAddress?.name || 'N/A',
        buyerContact: o.buyer?.phone || o.deliveryAddress?.phone || o.buyer?.email || 'N/A',
        sellerName: o.seller?.name || 'N/A',
        price: o.totalAmount || o.price || 0,
        status: o.status || 'pending',
        date: o.createdAt,
    }));

    res.status(200).json({
        success: true,
        count: formattedOrders.length,
        data: formattedOrders,
    });
});

// ─── @desc    Update order status ────────────────────────────────────────────
// ─── @route   PATCH /api/admin/orders/:id ─────────────────────────────────────
// ─── @access  Private/Admin+Manager ──────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

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
        totalNeeds,
        totalStudyMaterials,
        totalUpdates,
        totalServices,
        totalReports,
        totalPromotions,
    ] = await Promise.all([
        Order.countDocuments(),
        User.countDocuments(),
        Item.countDocuments(),
        Need.countDocuments(),
        Study.countDocuments(),
        CampusUpdate.countDocuments(),
        ProviderService.countDocuments({ status: { $ne: 'deleted' } }),
        Report.countDocuments({ status: 'pending' }),
        Promotion.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalOrders,
            totalUsers,
            totalItems,
            totalNeeds,
            totalStudyMaterials,
            totalUpdates,
            totalServices,
            totalReports,
            totalPromotions,
        },
    });
});

// ─── @desc    Get all provider services (admin) ─────────────────────────────
// ─── @route   GET /api/admin/services ───────────────────────────────────────
// ─── @access  Private/Admin ─────────────────────────────────────────────────
export const getAllAdminServices = asyncHandler(async (req, res) => {
    const services = await ProviderService.find({ status: { $ne: 'deleted' } })
        .populate({
            path: 'provider',
            select: 'businessName name email phone providerTypes location verificationStatus',
        })
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: services.length,
        data: services,
    });
});

// ─── @desc    Toggle service active/hidden status (admin) ───────────────────
// ─── @route   PATCH /api/admin/services/:id/status ─────────────────────────
// ─── @access  Private/Admin ─────────────────────────────────────────────────
export const toggleAdminServiceStatus = asyncHandler(async (req, res) => {
    const service = await ProviderService.findById(req.params.id);
    if (!service) {
        return res.status(404).json({ success: false, message: 'Provider service not found' });
    }
    service.status = service.status === 'active' ? 'hidden' : 'active';
    await service.save();
    res.status(200).json({
        success: true,
        message: `Service status updated to "${service.status}"`,
        data: service,
    });
});

// ─── @desc    Delete a provider service (admin) ──────────────────────────────
// ─── @route   DELETE /api/admin/services/:id ─────────────────────────────────
// ─── @access  Private/Admin ─────────────────────────────────────────────────
export const deleteAdminService = asyncHandler(async (req, res) => {
    const service = await ProviderService.findById(req.params.id);
    if (!service) {
        return res.status(404).json({ success: false, message: 'Provider service not found' });
    }
    await ProviderService.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success: true,
        message: 'Provider service deleted successfully',
    });
});

// ─── @desc    Delete comment on item post (admin) ─────────────────────────────
// ─── @route   DELETE /api/admin/items/:itemId/comments/:commentId ───────────
// ─── @access  Private/Admin ─────────────────────────────────────────────────
export const deleteAdminItemComment = asyncHandler(async (req, res) => {
    const { itemId, commentId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }
    item.comments = (item.comments || []).filter((c) => c._id.toString() !== commentId);
    await item.save();
    res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: item.comments,
    });
});

// ─── @desc    Get all registered users (admin) ──────────────────────────────
// ─── @route   GET /api/admin/users ─────────────────────────────────────────
// ─── @access  Private/Admin ─────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select('-password')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: users.length,
        data: users,
    });
});

// ─── @desc    Get all provider applications (admin) ──────────────────────────
// ─── @route   GET /api/admin/providers ───────────────────────────────────────
// ─── @access  Private/Admin ─────────────────────────────────────────────────
export const getAllProviders = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = status ? { verificationStatus: status } : {};

    const providers = await Provider.find(filter)
        .populate('user', 'name email phone studtradeID')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: providers.length,
        data: providers,
    });
});

// ─── @desc    Update provider verification status (approve, reject, suspend) ─
// ─── @route   PATCH /api/admin/providers/:id/status ───────────────────────────
// ─── @access  Private/Admin ─────────────────────────────────────────────────
export const updateProviderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const VALID_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

    if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
    }

    const provider = await Provider.findById(req.params.id);

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    provider.verificationStatus = status;
    await provider.save();

    // Create system notification for provider
    let title = 'Account Status Update';
    let msg = `Your provider account verification status has been updated to "${status}".`;

    if (status === 'approved') {
        title = 'Account Approved! 🎉';
        msg = 'Congratulations! Your provider application has been approved. You can now publish public services.';
    } else if (status === 'suspended') {
        title = 'Account Suspended ⚠️';
        msg = 'Your provider account has been temporarily suspended by STUDTRADE admin.';
    }

    await ProviderNotification.create({
        provider: provider._id,
        title,
        message: msg,
        type: 'approval',
    });

    res.status(200).json({
        success: true,
        message: `Provider status updated to "${status}"`,
        data: provider,
    });
});

// ─── @desc    Delete provider application ────────────────────────────────────
// ─── @route   DELETE /api/admin/providers/:id ────────────────────────────────
// ─── @access  Private/Admin ─────────────────────────────────────────────────
export const deleteProvider = asyncHandler(async (req, res) => {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    await Provider.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: 'Provider application deleted successfully',
    });
});
