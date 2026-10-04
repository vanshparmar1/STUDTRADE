import { Router } from 'express';
import {
    getAllReports,
    reviewReport,
    getAllOrders,
    updateOrderStatus,
    getDashboardStats,
    getAllUsers,
    getAllProviders,
    updateProviderStatus,
    deleteProvider,
    getAllAdminServices,
    toggleAdminServiceStatus,
    deleteAdminService,
    deleteAdminItemComment,
} from '../controllers/admin.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin or manager role
router.use(protect, authorizeRoles('admin', 'manager'));

// GET /api/admin/reports — get all reports
router.get('/reports', getAllReports);

// PATCH /api/admin/reports/:id/review — review or dismiss a report
router.patch('/reports/:id/review', reviewReport);

// GET /api/admin/orders — get all orders & resource usage
router.get('/orders', getAllOrders);

// PATCH /api/admin/orders/:id — update order status (pending → confirmed → delivered)
router.patch('/orders/:id', updateOrderStatus);

// GET /api/admin/dashboard — platform stats
router.get('/dashboard', getDashboardStats);

// GET /api/admin/users — all registered users
router.get('/users', getAllUsers);

// Services management routes
router.get('/services', getAllAdminServices);
router.patch('/services/:id/status', toggleAdminServiceStatus);
router.delete('/services/:id', deleteAdminService);

// Comment management routes
router.delete('/items/:itemId/comments/:commentId', deleteAdminItemComment);

// Provider management routes
router.get('/providers', getAllProviders);
router.patch('/providers/:id/status', updateProviderStatus);
router.delete('/providers/:id', deleteProvider);

export default router;
