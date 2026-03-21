import User from '../models/User.js';
import Item from '../models/Item.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Get cart for the logged-in user ─────────────────────────────────
// ─── @route   GET /api/cart ───────────────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: 'cartItems.item',
            select: 'title price images category condition status',
        });

    const cartItems = user.cartItems.filter(
        (entry) => entry.item && entry.item.status === 'available'
    );

    const subtotal = cartItems.reduce(
        (sum, entry) => sum + entry.item.price * entry.quantity,
        0
    );

    res.status(200).json({
        success: true,
        count: cartItems.length,
        subtotal,
        data: cartItems,
    });
});

// ─── @desc    Add item to cart (or increment quantity if already in cart) ──────
// ─── @route   POST /api/cart ──────────────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
export const addToCart = asyncHandler(async (req, res) => {
    const { itemId, quantity = 1 } = req.body;

    // Validate quantity
    const qty = Number(quantity);
    if (!qty || qty < 1 || !Number.isInteger(qty)) {
        const error = new Error('Quantity must be a positive integer');
        error.statusCode = 400;
        throw error;
    }

    // Ensure item exists and is available
    const item = await Item.findById(itemId);
    if (!item) {
        const error = new Error('Item not found');
        error.statusCode = 404;
        throw error;
    }
    if (item.status !== 'available') {
        const error = new Error('This item is no longer available');
        error.statusCode = 400;
        throw error;
    }

    // Prevent adding own item
    if (item.seller.toString() === req.user._id.toString()) {
        const error = new Error('You cannot add your own listing to your cart');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(req.user._id);

    // Check if item already exists in cart — increment quantity instead of duplicating
    const existingIndex = user.cartItems.findIndex(
        (entry) => entry.item.toString() === itemId
    );

    if (existingIndex !== -1) {
        user.cartItems[existingIndex].quantity += qty;
    } else {
        user.cartItems.push({ item: itemId, quantity: qty });
    }

    await user.save();

    // Return populated cart entry
    await user.populate({
        path: 'cartItems.item',
        select: 'title price images category condition status',
    });

    res.status(200).json({
        success: true,
        message: existingIndex !== -1 ? 'Cart quantity updated' : 'Item added to cart',
        data: user.cartItems,
    });
});

// ─── @desc    Remove a single item from cart ──────────────────────────────────
// ─── @route   DELETE /api/cart/:itemId ────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
export const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const user = await User.findById(req.user._id);

    const prevLength = user.cartItems.length;
    user.cartItems = user.cartItems.filter(
        (entry) => entry.item.toString() !== itemId
    );

    if (user.cartItems.length === prevLength) {
        return res.status(404).json({
            success: false,
            message: 'Item not in cart',
        });
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: user.cartItems,
    });
});

// ─── @desc    Clear all items from cart ───────────────────────────────────────
// ─── @route   DELETE /api/cart ────────────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
export const clearCart = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { cartItems: [] });

    res.status(200).json({
        success: true,
        message: 'Cart cleared',
        data: [],
    });
});
