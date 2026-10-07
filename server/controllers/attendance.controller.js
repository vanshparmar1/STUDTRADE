import Attendance from '../models/Attendance.js';
import Provider from '../models/Provider.js';
import Customer from '../models/Customer.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to format Date to YYYY-MM-DD
const formatDateStr = (dateInput) => {
    if (!dateInput) return new Date().toISOString().split('T')[0];
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
};

// ─── @desc    Get Attendance Records for Provider ────────────────────────────
// ─── @route   GET /api/attendance ─────────────────────────────────────────────
// ─── @access  Private (Provider only) ────────────────────────────────────────
export const getAttendanceRecords = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const dateStr = req.query.dateStr ? formatDateStr(req.query.dateStr) : formatDateStr(new Date());
    const serviceType = req.query.serviceType || 'mess';
    const mealType = req.query.mealType || (serviceType === 'mess' ? 'lunch' : 'water');

    const filter = {
        provider: provider._id,
        dateStr,
        serviceType,
    };

    if (mealType && mealType !== 'all') {
        filter.mealType = mealType;
    }

    const records = await Attendance.find(filter)
        .populate('customer', 'name contact serviceName status')
        .sort('createdAt');

    res.status(200).json({
        success: true,
        count: records.length,
        data: records,
    });
});

// ─── @desc    Get Provider Customers with Attendance Status for a Date ───────
// ─── @route   GET /api/attendance/customers ──────────────────────────────────
// ─── @access  Private (Provider only) ────────────────────────────────────────
export const getAttendanceCustomers = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const dateStr = req.query.dateStr ? formatDateStr(req.query.dateStr) : formatDateStr(new Date());
    const serviceType = req.query.serviceType || 'mess';
    const mealType = req.query.mealType || (serviceType === 'mess' ? 'lunch' : 'water');

    // Fetch all active customers belonging to this provider
    const customers = await Customer.find({ provider: provider._id, status: 'Active' }).sort('name');

    // Fetch existing attendance records for this date, serviceType, and mealType
    const attendanceRecords = await Attendance.find({
        provider: provider._id,
        dateStr,
        serviceType,
        mealType,
    });

    // Create a lookup map by customer ID string
    const attendanceMap = new Map();
    attendanceRecords.forEach((rec) => {
        attendanceMap.set(rec.customer.toString(), rec);
    });

    // Map customers with their attendance info
    const customerList = customers.map((cust) => {
        const rec = attendanceMap.get(cust._id.toString());
        return {
            _id: cust._id,
            name: cust.name,
            contact: cust.contact,
            serviceName: cust.serviceName,
            status: cust.status,
            attendanceId: rec ? rec._id : null,
            attendanceStatus: rec ? rec.status : null, // 'present', 'absent', 'delivered', 'not_delivered', or null
            notes: rec ? rec.notes : '',
            updatedAt: rec ? rec.updatedAt : null,
        };
    });

    res.status(200).json({
        success: true,
        count: customerList.length,
        dateStr,
        serviceType,
        mealType,
        data: customerList,
    });
});

// ─── @desc    Get Attendance Summary for Provider for a Date ─────────────────
// ─── @route   GET /api/attendance/summary ────────────────────────────────────
// ─── @access  Private (Provider only) ────────────────────────────────────────
export const getAttendanceSummary = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const dateStr = req.query.dateStr ? formatDateStr(req.query.dateStr) : formatDateStr(new Date());

    // Total active customers
    const totalCustomers = await Customer.countDocuments({ provider: provider._id, status: 'Active' });

    // Fetch all records for dateStr
    const records = await Attendance.find({
        provider: provider._id,
        dateStr,
    });

    // Summarize
    let lunchPresent = 0, lunchAbsent = 0;
    let dinnerPresent = 0, dinnerAbsent = 0;
    let waterDelivered = 0, waterNotDelivered = 0;

    records.forEach((rec) => {
        if (rec.serviceType === 'mess') {
            if (rec.mealType === 'lunch') {
                if (rec.status === 'present') lunchPresent++;
                if (rec.status === 'absent') lunchAbsent++;
            } else if (rec.mealType === 'dinner') {
                if (rec.status === 'present') dinnerPresent++;
                if (rec.status === 'absent') dinnerAbsent++;
            }
        } else if (rec.serviceType === 'water') {
            if (rec.status === 'delivered') waterDelivered++;
            if (rec.status === 'not_delivered') waterNotDelivered++;
        }
    });

    res.status(200).json({
        success: true,
        dateStr,
        totalCustomers,
        summary: {
            mess: {
                lunch: { present: lunchPresent, absent: lunchAbsent, total: totalCustomers },
                dinner: { present: dinnerPresent, absent: dinnerAbsent, total: totalCustomers },
            },
            water: {
                delivered: waterDelivered,
                notDelivered: waterNotDelivered,
                total: totalCustomers,
            },
        },
    });
});

// ─── @desc    Create or Update Single Attendance Record (Upsert) ──────────────
// ─── @route   POST /api/attendance ────────────────────────────────────────────
// ─── @access  Private (Provider only) ────────────────────────────────────────
export const upsertAttendanceRecord = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const { customerId, dateStr: rawDateStr, serviceType, mealType, status, notes } = req.body;

    if (!customerId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }

    const validStatus = ['present', 'absent', 'delivered', 'not_delivered'];
    if (!status || !validStatus.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid attendance status value' });
    }

    // Verify customer belongs to provider
    const customer = await Customer.findOne({ _id: customerId, provider: provider._id });
    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer record not found for this provider' });
    }

    const dateStr = formatDateStr(rawDateStr);
    const sType = serviceType === 'water' ? 'water' : 'mess';
    const mType = sType === 'water' ? 'water' : (mealType === 'dinner' ? 'dinner' : 'lunch');

    const record = await Attendance.findOneAndUpdate(
        {
            provider: provider._id,
            customer: customer._id,
            dateStr,
            serviceType: sType,
            mealType: mType,
        },
        {
            provider: provider._id,
            customer: customer._id,
            student: customer.student || null,
            serviceType: sType,
            mealType: mType,
            dateStr,
            date: new Date(dateStr),
            status,
            notes: notes || '',
        },
        { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: record,
    });
});

// ─── @desc    Bulk Mark Attendance for All Active Customers ──────────────────
// ─── @route   POST /api/attendance/bulk ───────────────────────────────────────
// ─── @access  Private (Provider only) ────────────────────────────────────────
export const bulkUpsertAttendance = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const { dateStr: rawDateStr, serviceType, mealType, status } = req.body;

    const validStatus = ['present', 'absent', 'delivered', 'not_delivered'];
    if (!status || !validStatus.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid attendance status' });
    }

    const dateStr = formatDateStr(rawDateStr);
    const sType = serviceType === 'water' ? 'water' : 'mess';
    const mType = sType === 'water' ? 'water' : (mealType === 'dinner' ? 'dinner' : 'lunch');

    const activeCustomers = await Customer.find({ provider: provider._id, status: 'Active' });

    if (activeCustomers.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No active customers found to update attendance',
            count: 0,
        });
    }

    const operations = activeCustomers.map((cust) => ({
        updateOne: {
            filter: {
                provider: provider._id,
                customer: cust._id,
                dateStr,
                serviceType: sType,
                mealType: mType,
            },
            update: {
                $set: {
                    provider: provider._id,
                    customer: cust._id,
                    student: cust.student || null,
                    serviceType: sType,
                    mealType: mType,
                    dateStr,
                    date: new Date(dateStr),
                    status,
                },
            },
            upsert: true,
        },
    }));

    await Attendance.bulkWrite(operations);

    res.status(200).json({
        success: true,
        message: `Marked all customers as ${status}`,
        count: activeCustomers.length,
    });
});

// ─── @desc    Delete Attendance Record ───────────────────────────────────────
// ─── @route   DELETE /api/attendance/:id ─────────────────────────────────────
// ─── @access  Private (Provider only) ────────────────────────────────────────
export const deleteAttendanceRecord = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const record = await Attendance.findOne({ _id: req.params.id, provider: provider._id });

    if (!record) {
        return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    await record.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Attendance record deleted',
    });
});
