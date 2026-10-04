import Item from '../models/Item.js';
import asyncHandler from '../utils/asyncHandler.js';
import { toCatalogItem } from '../utils/catalogItem.js';

// ─── @desc    Create a new item listing ──────────────────────────────────────
// ─── @route   POST /api/items ────────────────────────────────────────────────
// ─── @access  Private (any logged-in user) ───────────────────────────────────
export const createItem = asyncHandler(async (req, res) => {
    const { title, description, price, category, condition } = req.body;

    const pickupAddress = {
        fullAddress: req.body['pickupAddress.fullAddress'] || req.body.pickupAddress?.fullAddress || 'Main Campus',
        locality: req.body['pickupAddress.locality'] || req.body.pickupAddress?.locality || 'Main Campus',
        city: req.body['pickupAddress.city'] || req.body.pickupAddress?.city || 'Campus',
        pincode: req.body['pickupAddress.pincode'] || req.body.pickupAddress?.pincode || '',
        landmark: req.body['pickupAddress.landmark'] || req.body.pickupAddress?.landmark || '',
    };

    // Extract Cloudinary URLs from uploaded files if attached
    const imageUrls = (req.files && req.files.length > 0) ? req.files.map((file) => file.path) : [];

    const finalTitle = (title || description || 'Campus Post').trim();
    const finalDesc = (description || title || 'Campus post and listing item.').trim();

    // Create item in MongoDB database
    const item = await Item.create({
        title: finalTitle,
        description: finalDesc,
        price: price !== undefined && !isNaN(Number(price)) ? Number(price) : 0,
        category: category || 'Other',
        condition: condition || 'Good',
        pickupAddress,
        images: imageUrls,
        seller: req.user._id,
        status: 'available',
    });

    const populated = await Item.findById(item._id).populate('seller', '_id name email phone');

    res.status(201).json({
        success: true,
        message: 'Item listed successfully',
        data: toCatalogItem(populated || item),
    });
});

// ─── Allowlists for query param validation ────────────────────────────────────
const VALID_CATEGORIES = ['Books', 'Cycles', 'Tech', 'Furniture', 'Housing', 'Need', 'Other'];
const VALID_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

// ─── @desc    Get all items (with filters + pagination) ──────────────────────
// ─── @route   GET /api/items ─────────────────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getAllItems = asyncHandler(async (req, res) => {
    const {
        category,
        condition,
        minPrice,
        maxPrice,
        search,
        page = 1,
        limit = 12,
    } = req.query;

    // ── Validate + coerce numeric params (reject objects / NaN) ──────────────
    const parsedMin = minPrice !== undefined ? Number(minPrice) : undefined;
    const parsedMax = maxPrice !== undefined ? Number(maxPrice) : undefined;

    if (parsedMin !== undefined && isNaN(parsedMin)) {
        const error = new Error('minPrice must be a number');
        error.statusCode = 400;
        throw error;
    }
    if (parsedMax !== undefined && isNaN(parsedMax)) {
        const error = new Error('maxPrice must be a number');
        error.statusCode = 400;
        throw error;
    }

    // ── Allowlist category and condition to prevent operator injection ─────────
    if (category && !VALID_CATEGORIES.includes(category)) {
        const error = new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }
    if (condition && !VALID_CONDITIONS.includes(condition)) {
        const error = new Error(`Invalid condition. Must be one of: ${VALID_CONDITIONS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    // ── Build filter object dynamically ──────────────────────────────────────
    const filter = { status: { $in: ['available', 'sold'] } };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;

    if (parsedMin !== undefined || parsedMax !== undefined) {
        filter.price = {};
        if (parsedMin !== undefined) filter.price.$gte = parsedMin;
        if (parsedMax !== undefined) filter.price.$lte = parsedMax;
    }

    // Full-text search (uses the text index on title + description)
    if (search) {
        filter.$text = { $search: search };
    }

    // ── Pagination ───────────────────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * perPage;

    // ── Execute query + count in parallel ────────────────────────────────────
    const sortOptions = search
        ? { score: { $meta: 'textScore' } }
        : { status: 1, createdAt: -1 };

    const [items, total] = await Promise.all([
        Item.find(filter, search ? { score: { $meta: 'textScore' } } : {})
            .populate('seller', '_id name email phone avatar verificationStatus')
            .sort(sortOptions)
            .skip(skip)
            .limit(perPage),
        Item.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / perPage),
        data: items.map(toCatalogItem),
    });
});

// ─── @desc    Get single item ─────────────────────────────────────────────────
// ─── @route   GET /api/items/:id ─────────────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getSingleItem = asyncHandler(async (req, res) => {
    // Atomic increment of views + fetching populated data in one go
    const item = await Item.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
    ).populate('seller', '_id name email phone avatar verificationStatus');


    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found',
        });
    }

    res.status(200).json({
        success: true,
        data: toCatalogItem(item),
    });
});

// ─── @desc    Update item ─────────────────────────────────────────────────────
// ─── @route   PUT /api/items/:id ─────────────────────────────────────────────
// ─── @access  Private (Owner or Admin) ───────────────────────────────────────
export const updateItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found',
        });
    }

    // Make sure user is item owner, admin, or manager
    if (
        item.seller.toString() !== req.user._id.toString() &&
        !['admin', 'manager'].includes(req.user.role)
    ) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this item',
        });
    }

    // Explicit allowlist — prevent mass-assignment of seller, status, views, etc.
    const { title, description, price, category, condition, images } = req.body;
    const allowedUpdates = {};
    if (title !== undefined) allowedUpdates.title = title;
    if (description !== undefined) allowedUpdates.description = description;
    if (price !== undefined) allowedUpdates.price = Number(price);
    if (category !== undefined) allowedUpdates.category = category;
    if (condition !== undefined) allowedUpdates.condition = condition;
    if (images !== undefined) allowedUpdates.images = images;

    const hasFlatPickup = [
        'pickupAddress.fullAddress',
        'pickupAddress.locality',
        'pickupAddress.city',
        'pickupAddress.pincode',
        'pickupAddress.landmark',
    ].some((k) => req.body[k] !== undefined);
    const nestedPickup =
        req.body.pickupAddress !== undefined &&
        req.body.pickupAddress !== null &&
        typeof req.body.pickupAddress === 'object';

    if (hasFlatPickup || nestedPickup) {
        const existing = item.pickupAddress?.toObject?.() ?? item.pickupAddress ?? {};
        const src = nestedPickup ? req.body.pickupAddress : {};
        const next = {
            fullAddress:
                req.body['pickupAddress.fullAddress'] ??
                src.fullAddress ??
                existing.fullAddress,
            locality:
                req.body['pickupAddress.locality'] ?? src.locality ?? existing.locality,
            city: req.body['pickupAddress.city'] ?? src.city ?? existing.city,
            pincode: req.body['pickupAddress.pincode'] ?? src.pincode ?? existing.pincode,
            landmark: req.body['pickupAddress.landmark'] ?? src.landmark ?? existing.landmark,
        };
        const pin = next.pincode && String(next.pincode).trim();
        if (pin && !/^\d{6}$/.test(pin)) {
            const error = new Error('Pickup pincode must be a 6-digit number');
            error.statusCode = 400;
            throw error;
        }
        allowedUpdates.pickupAddress = next;
    }

    const updated = await Item.findByIdAndUpdate(req.params.id, allowedUpdates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: updated,
    });
});

// ─── @desc    Mark item as sold ──────────────────────────────────────────────
// ─── @route   PATCH /api/items/:id/sold ──────────────────────────────────────
// ─── @access  Private (Owner only) ───────────────────────────────────────────
export const markAsSold = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found',
        });
    }

    // Only the seller can mark their own item as sold
    if (item.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to mark this item as sold',
        });
    }

    item.status = 'sold';
    await item.save();

    res.status(200).json({
        success: true,
        message: 'Item marked as sold',
        data: item,
    });
});

// ─── @desc    Delete item ─────────────────────────────────────────────────────
// ─── @route   DELETE /api/items/:id ──────────────────────────────────────────
// ─── @access  Private (Owner or Admin) ───────────────────────────────────────
export const deleteItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found',
        });
    }

    // Allow item owner or admin/manager to delete item
    if (
        item.seller.toString() !== req.user._id.toString() &&
        !['admin', 'manager'].includes(req.user.role)
    ) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this item',
        });
    }

    await item.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Item deleted successfully',
        data: { id: req.params.id },
    });
});

// ─── @desc    Toggle like status on an item post ──────────────────────────────
// ─── @route   POST /api/items/:id/like ────────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
export const toggleLikeItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found',
        });
    }

    const userId = req.user._id;
    if (!item.likes) item.likes = [];

    const existingIndex = item.likes.findIndex(
        (id) => id.toString() === userId.toString()
    );

    let isLiked = false;
    if (existingIndex >= 0) {
        item.likes.splice(existingIndex, 1);
        isLiked = false;
    } else {
        item.likes.push(userId);
        isLiked = true;
    }

    await item.save();

    res.status(200).json({
        success: true,
        message: isLiked ? 'Item liked' : 'Item unliked',
        data: {
            likesCount: item.likes.length,
            isLiked,
            likes: item.likes,
        },
    });
});

// ─── @desc    Add a comment to an item post ──────────────────────────────────
// ─── @route   POST /api/items/:id/comment ─────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
export const addCommentItem = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Comment text is required',
        });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found',
        });
    }

    if (!item.comments) item.comments = [];

    const newComment = {
        user: req.user._id,
        userName: req.user.name || 'Campus Member',
        text: text.trim(),
        createdAt: new Date(),
    };

    item.comments.push(newComment);
    await item.save();

    res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: {
            comments: item.comments,
            comment: newComment,
        },
    });
});

