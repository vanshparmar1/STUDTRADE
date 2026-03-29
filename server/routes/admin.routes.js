import { Router } from 'express';
import { getAllReports, reviewReport, getAllOrders, updateOrderStatus, getDashboardStats } from '../controllers/admin.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin or manager role
router.use(protect, authorizeRoles('admin', 'manager'));

// GET /api/admin/reports — get all reports
router.get('/reports', getAllReports);

// PATCH /api/admin/reports/:id/review — review or dismiss a report
router.patch('/reports/:id/review', reviewReport);

// GET /api/admin/orders — get all orders (buyer, seller, item, time, payment)
router.get('/orders', getAllOrders);

// PATCH /api/admin/orders/:id — update order status (pending → confirmed → delivered)
router.patch('/orders/:id', updateOrderStatus);

// GET /api/admin/dashboard — platform stats
router.get('/dashboard', getDashboardStats);

export default router;
