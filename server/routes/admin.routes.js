import { Router } from 'express';
import { getAllReports, reviewReport } from '../controllers/admin.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorizeRoles('admin'));

// GET /api/admin/reports — get all reports
router.get('/reports', getAllReports);

// PATCH /api/admin/reports/:id/review — review or dismiss a report
router.patch('/reports/:id/review', reviewReport);

export default router;
