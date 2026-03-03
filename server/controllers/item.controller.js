import Item from '../models/Item.js';

// ─── @desc    Create a new item listing ──────────────────────────────────────
// ─── @route   POST /api/items ────────────────────────────────────────────────
// ─── @access  Private (any logged-in user) ───────────────────────────────────
export const createItem = async (req, res, next) => {
    try {
        const { title, description, price, category, condition } = req.body;

        // 1. Validate required fields
        if (!title || !description || !price || !category || !condition) {
            const error = new Error('Title, description, price, category, and condition are required');
            error.statusCode = 400;
            throw error;
        }

        // 2. Require at least one uploaded image
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
            status: 'available', // explicit default
        });

        res.status(201).json({
            success: true,
            message: 'Item listed successfully',
            data: item,
        });
    } catch (err) {
        next(err);
    }
};

// ─── @desc    Get all items (with filters + pagination) ──────────────────────
// ─── @route   GET /api/items ─────────────────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getAllItems = async (req, res, next) => {
    try {
        const {
            category,
            condition,
            minPrice,
            maxPrice,
            search,
            page = 1,
            limit = 12,
        } = req.query;

        // ── Build filter object dynamically ──────────────────────────────────
        // Only fetch available and sold items (exclude any deleted/draft if added later)
        const filter = { status: { $in: ['available', 'sold'] } };

        if (category) filter.category = category;
        if (condition) filter.condition = condition;

        // Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Full-text search (uses the text index on title + description)
        if (search) {
            filter.$text = { $search: search };
        }

        // ── Pagination ───────────────────────────────────────────────────────
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const perPage = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
        const skip = (pageNum - 1) * perPage;

        // ── Execute query + count in parallel ────────────────────────────────
        const [items, total] = await Promise.all([
            Item.find(filter)
                .populate('seller', 'name email phone')
                .sort({ status: 1, createdAt: -1 }) // available first, then newest
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
    } catch (err) {
        next(err);
    }
};

// ─── @desc    Get single item ─────────────────────────────────────────────────
// ─── @route   GET /api/items/:id ─────────────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const getSingleItem = async (req, res, next) => {
    try {
        // Atomic increment of views + fetching populated data in one go
        const item = await Item.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true, runValidators: true }
        ).populate('seller', 'name email phone');

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
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Item not found (invalid ID)',
            });
        }
        next(err);
    }
};

// ─── @desc    Update item ───────────────────────────────────────────────────
// ─── @route   PUT /api/items/:id ─────────────────────────────────────────────
// ─── @access  Private (Owner or Admin) ───────────────────────────────────────
export const updateItem = async (req, res, next) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        // Make sure user is item owner or admin
        if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this item',
            });
        }

        item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: item,
        });
    } catch (err) {
        next(err);
    }
};

// ─── @desc    Mark item as sold ──────────────────────────────────────────────
// ─── @route   PATCH /api/items/:id/sold ──────────────────────────────────────
// ─── @access  Private (Owner only) ───────────────────────────────────────────
export const markAsSold = async (req, res, next) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        // Only seller can mark as sold
        if (item.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({
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
    } catch (err) {
        next(err);
    }
};
