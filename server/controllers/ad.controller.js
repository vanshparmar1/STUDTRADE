import Ad from '../models/Ad.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all active ads
// @route   GET /api/ads
// @access  Public
export const getActiveAds = asyncHandler(async (req, res) => {
    const ads = await Ad.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: ads.length,
        data: ads,
    });
});
