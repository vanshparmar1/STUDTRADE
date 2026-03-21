import { Router } from 'express';
import { getAllReports, reviewReport, getAllOrders, getDashboardStats } from '../controllers/admin.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorizeRoles('admin'));

// GET /api/admin/reports — get all reports
router.get('/reports', getAllReports);

// PATCH /api/admin/reports/:id/review — review or dismiss a report
router.patch('/reports/:id/review', reviewReport);

// GET /api/admin/orders — get all orders (buyer, seller, item, time, payment)
router.get('/orders', getAllOrders);

// GET /api/admin/dashboard — platform stats
router.get('/dashboard', getDashboardStats);

export default router;
