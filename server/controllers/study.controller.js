import Study from '../models/Study.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/study
export const getAllStudyMaterials = asyncHandler(async (req, res) => {
    const { branch, year, subject, contentType, search } = req.query;
    const filter = {};

    if (branch && branch !== 'All Branches' && branch !== 'All') {
        filter.branch = { $in: [branch, 'All Branches'] };
    }

    if (year && year !== 'All Years' && year !== 'All') {
        filter.year = year;
    }

    if (contentType && contentType !== 'All Types' && contentType !== 'All') {
        filter.contentType = contentType;
    }

    if (subject && subject.trim() && subject !== 'All') {
        filter.subject = { $regex: subject.trim(), $options: 'i' };
    }

    if (search && search.trim()) {
        filter.$or = [
            { title: { $regex: search.trim(), $options: 'i' } },
            { subject: { $regex: search.trim(), $options: 'i' } },
            { description: { $regex: search.trim(), $options: 'i' } },
        ];
    }

    const list = await Study.find(filter)
        .populate('uploadedBy', '_id name email')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: list.length,
        data: list,
    });
});

// POST /api/study
export const createStudyMaterial = asyncHandler(async (req, res) => {
    const { title, description, branch, year, subject, contentType, semester, unit, fileUrl, fileName, fileSize, fileType } = req.body;

    let finalFileUrl = fileUrl;
    let finalFileName = fileName || 'document.pdf';
    let finalFileSize = fileSize || '1.5 MB';
    let finalFileType = fileType || 'application/pdf';

    // If file uploaded via Multer
    if (req.files && req.files.length > 0) {
        finalFileUrl = req.files[0].path;
        finalFileName = req.files[0].originalname;
        finalFileSize = (req.files[0].size / (1024 * 1024)).toFixed(1) + ' MB';
        finalFileType = req.files[0].mimetype;
    } else if (req.file) {
        finalFileUrl = req.file.path;
        finalFileName = req.file.originalname;
        finalFileSize = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
        finalFileType = req.file.mimetype;
    }

    if (!finalFileUrl) {
        return res.status(400).json({ success: false, message: 'Document or file is required' });
    }

    const material = await Study.create({
        title: title || 'Study Material',
        description: description || '',
        branch: branch || 'CSE',
        year: year || '1st Year',
        subject: subject || 'General',
        contentType: contentType || 'Notes',
        semester: semester || 'Semester 1',
        unit: unit || '',
        fileUrl: finalFileUrl,
        fileName: finalFileName,
        fileSize: finalFileSize,
        fileType: finalFileType,
        uploadedBy: req.user._id,
        uploadedByName: req.user.name || 'Verified Student',
    });

    res.status(201).json({
        success: true,
        message: 'Study material uploaded successfully to MongoDB',
        data: material,
    });
});

// DELETE /api/study/:id
export const deleteStudyMaterial = asyncHandler(async (req, res) => {
    const item = await Study.findById(req.params.id);

    if (!item) {
        return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    if (item.uploadedBy.toString() !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this study material' });
    }

    await item.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Study material deleted successfully from MongoDB',
        data: { id: req.params.id },
    });
});

// POST /api/study/:id/view
export const incrementStudyView = asyncHandler(async (req, res) => {
    const item = await Study.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewsCount: 1 } },
        { returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: item });
});

// POST /api/study/:id/download
export const incrementStudyDownload = asyncHandler(async (req, res) => {
    const item = await Study.findByIdAndUpdate(
        req.params.id,
        { $inc: { downloadsCount: 1 } },
        { returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: item });
});
