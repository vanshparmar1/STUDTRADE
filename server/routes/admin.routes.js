import { Router } from 'express';
import { getPendingUsers, approveUser, rejectUser } from '../controllers/admin.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorizeRoles('admin'));

// GET /api/admin/pending-users — get all users waiting for KYC approval
router.get('/pending-users', getPendingUsers);

// PATCH /api/admin/verify/:userId — approve a user's KYC
router.patch('/verify/:userId', approveUser);

// PATCH /api/admin/reject/:userId — reject a user's KYC
router.patch('/reject/:userId', rejectUser);


export default router;
