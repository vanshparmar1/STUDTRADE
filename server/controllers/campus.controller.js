import CampusUpdate from '../models/CampusUpdate.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/campus-updates
export const getAllCampusUpdates = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const filter = { expiresAt: { $gte: new Date() } };

    if (category && category !== 'All') {
        filter.category = category;
    }

    const updates = await CampusUpdate.find(filter)
        .populate('createdBy', '_id name email')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: updates.length,
        data: updates,
    });
});

// POST /api/campus-updates
export const createCampusUpdate = asyncHandler(async (req, res) => {
    const { title, description, category, location, durationHours } = req.body;

    const hours = Number(durationHours) || 24;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    const update = await CampusUpdate.create({
        title,
        description: description || '',
        category: category || 'General',
        location: location || 'Main Campus',
        expiresAt,
        createdBy: req.user._id,
        authorName: req.user.name || 'Verified Student',
    });

    res.status(201).json({
        success: true,
        message: 'Campus update posted successfully to MongoDB',
        data: update,
    });
});

// DELETE /api/campus-updates/:id
export const deleteCampusUpdate = asyncHandler(async (req, res) => {
    const update = await CampusUpdate.findById(req.params.id);

    if (!update) {
        return res.status(404).json({ success: false, message: 'Campus update not found' });
    }

    if (update.createdBy.toString() !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this update' });
    }

    await update.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Campus update deleted successfully from MongoDB',
        data: { id: req.params.id },
    });
});
