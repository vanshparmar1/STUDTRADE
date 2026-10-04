import Need from '../models/Need.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/needs
export const getAllNeeds = asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const filter = { status: { $ne: 'EXPIRED' } };

    if (category && category !== 'All') {
        filter.category = category;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
        ];
    }

    const needs = await Need.find(filter)
        .populate('user', '_id name email')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: needs.length,
        data: needs,
    });
});

// POST /api/needs
export const createNeed = asyncHandler(async (req, res) => {
    const { title, description, category, budget, location, image } = req.body;

    const need = await Need.create({
        title,
        description,
        category: category || 'Item Needed',
        budget: budget || 'Flexible',
        location: location || 'Campus Area',
        user: req.user._id,
        userName: req.user.name || 'Student',
        userEmail: req.user.email || '',
        image: image || '',
        status: 'ACTIVE',
    });

    res.status(201).json({
        success: true,
        message: 'Need posted successfully to MongoDB',
        data: need,
    });
});

// PATCH /api/needs/:id/fulfill
export const markNeedFulfilled = asyncHandler(async (req, res) => {
    const need = await Need.findById(req.params.id);

    if (!need) {
        return res.status(404).json({ success: false, message: 'Need query not found' });
    }

    if (need.user.toString() !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized to fulfill this need' });
    }

    need.status = 'FULFILLED';
    await need.save();

    res.status(200).json({
        success: true,
        message: 'Need marked as fulfilled',
        data: need,
    });
});

// DELETE /api/needs/:id
export const deleteNeed = asyncHandler(async (req, res) => {
    const need = await Need.findById(req.params.id);

    if (!need) {
        return res.status(404).json({ success: false, message: 'Need query not found' });
    }

    if (need.user.toString() !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this need' });
    }

    await need.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Need deleted successfully from MongoDB',
        data: { id: req.params.id },
    });
});
