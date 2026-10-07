import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import {
    getAttendanceRecords,
    getAttendanceCustomers,
    getAttendanceSummary,
    upsertAttendanceRecord,
    bulkUpsertAttendance,
    deleteAttendanceRecord,
} from '../controllers/attendance.controller.js';

const router = express.Router();

// Private Provider routes (requires logged-in user with provider role)
router.use(protect);
router.use(authorizeRoles('provider', 'admin'));

router.get('/', getAttendanceRecords);
router.get('/customers', getAttendanceCustomers);
router.get('/summary', getAttendanceSummary);

router.post('/', upsertAttendanceRecord);
router.post('/bulk', bulkUpsertAttendance);
router.delete('/:id', deleteAttendanceRecord);

export default router;
