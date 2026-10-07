import Promotion from '../models/Promotion.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Get Active Promotions (Public for Carousel) ──────────────────────
// ─── @route   GET /api/promotions/active ─────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getActivePromotions = asyncHandler(async (req, res) => {
    const now = new Date();

    const filter = {
        isActive: true,
        startDate: { $lte: now },
        $or: [
            { endDate: null },
            { endDate: { $gte: now } }
        ]
    };

    const promotions = await Promotion.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
        success: true,
        count: promotions.length,
        data: promotions,
    });
});

// ─── @desc    Get All Promotions (Admin Management) ─────────────────────────
// ─── @route   GET /api/promotions/admin ──────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const getAdminPromotions = asyncHandler(async (req, res) => {
    const promotions = await Promotion.find()
        .populate('createdBy', 'name email')
        .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
        success: true,
        count: promotions.length,
        data: promotions,
    });
});

// ─── @desc    Create a New Promotion Slide ───────────────────────────────────
// ─── @route   POST /api/promotions ───────────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const createPromotion = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        offerText,
        category,
        buttonText,
        buttonLink,
        displayOrder,
        startDate,
        endDate,
        isActive,
        image: bodyImage,
    } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required for a promotion',
        });
    }

    let imageUrl = bodyImage || '';

    // Handle file upload if present via Multer
    if (req.file) {
        imageUrl = req.file.path;
    } else if (req.files && req.files.length > 0) {
        imageUrl = req.files[0].path;
    }

    const promotion = await Promotion.create({
        title,
        description,
        offerText: offerText || 'SPECIAL OFFER',
        image: imageUrl,
        category: category || 'Offer',
        buttonText: buttonText || 'Explore Now',
        buttonLink: buttonLink || '/marketplace',
        displayOrder: displayOrder !== undefined && !isNaN(Number(displayOrder)) ? Number(displayOrder) : 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive === undefined ? true : Boolean(isActive === 'true' || isActive === true),
        createdBy: req.user._id,
    });

    res.status(201).json({
        success: true,
        message: 'Promotion created successfully',
        data: promotion,
    });
});

// ─── @desc    Update a Promotion Slide ───────────────────────────────────────
// ─── @route   PUT /api/promotions/:id ────────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const updatePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
        return res.status(404).json({
            success: false,
            message: 'Promotion slide not found',
        });
    }

    const {
        title,
        description,
        offerText,
        category,
        buttonText,
        buttonLink,
        displayOrder,
        startDate,
        endDate,
        isActive,
        image: bodyImage,
    } = req.body;

    if (title) promotion.title = title;
    if (description) promotion.description = description;
    if (offerText !== undefined) promotion.offerText = offerText;
    if (category) promotion.category = category;
    if (buttonText !== undefined) promotion.buttonText = buttonText;
    if (buttonLink !== undefined) promotion.buttonLink = buttonLink;
    if (displayOrder !== undefined) promotion.displayOrder = Number(displayOrder);
    if (startDate) promotion.startDate = new Date(startDate);
    if (endDate !== undefined) promotion.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) promotion.isActive = Boolean(isActive === 'true' || isActive === true);

    if (req.file) {
        promotion.image = req.file.path;
    } else if (req.files && req.files.length > 0) {
        promotion.image = req.files[0].path;
    } else if (bodyImage !== undefined) {
        promotion.image = bodyImage;
    }

    await promotion.save();

    res.status(200).json({
        success: true,
        message: 'Promotion updated successfully',
        data: promotion,
    });
});

// ─── @desc    Toggle Promotion Active/Inactive Status ────────────────────────
// ─── @route   PATCH /api/promotions/:id/status ───────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const togglePromotionStatus = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
        return res.status(404).json({
            success: false,
            message: 'Promotion slide not found',
        });
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    res.status(200).json({
        success: true,
        message: `Promotion status updated to ${promotion.isActive ? 'Active' : 'Inactive'}`,
        data: promotion,
    });
});

// ─── @desc    Delete a Promotion Slide ───────────────────────────────────────
// ─── @route   DELETE /api/promotions/:id ─────────────────────────────────────
// ─── @access  Private/Admin ──────────────────────────────────────────────────
export const deletePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
        return res.status(404).json({
            success: false,
            message: 'Promotion slide not found',
        });
    }

    await promotion.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Promotion deleted successfully',
    });
});
