import Item from '../models/Item.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Create a new item listing ──────────────────────────────────────
// ─── @route   POST /api/items ────────────────────────────────────────────────
// ─── @access  Private (any logged-in user) ───────────────────────────────────
export const createItem = asyncHandler(async (req, res) => {
    const { title, description, price, category, condition } = req.body;

    // (required fields, length limits, and price/enum validation are pre-checked
    // by validate(createItemRules) middleware before this controller runs)

    // Require at least one uploaded image
    if (!req.files || req.files.length === 0) {
        const error = new Error('At least one image is required');
        error.statusCode = 400;
        throw error;
    }

    // 3. Extract Cloudinary URLs from uploaded files
    const imageUrls = req.files.map((file) => file.path);

    // 4. Create the item — seller comes from the protect middleware
    const item = await Item.create({
        title,
        description,
        price: Number(price),
        category,
        condition,
        images: imageUrls,
        seller: req.user._id,
        status: 'available',
    });

    res.status(201).json({
        success: true,
        message: 'Item listed successfully',
        data: item,
    });
});

// ─── Allowlists for query param validation ────────────────────────────────────
const VALID_CATEGORIES = ['Books', 'Cycles', 'Tech', 'Furniture', 'Other'];
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
            .populate('seller', '_id')           // _id only — no PII exposed
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
        data: items,
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
    ).populate('seller', '_id');                // _id only — no PII exposed

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found',
        });
    }

    res.status(200).json({
        success: true,
        data: item,
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
