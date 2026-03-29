import Order from '../models/Order.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Create orders from the user's cart ─────────────────────────────
// ─── @route   POST /api/orders ───────────────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
    const { deliveryAddress, paymentMethod } = req.body;

    // ── Validate required fields ─────────────────────────────────────────────
    if (
        !deliveryAddress?.name ||
        !deliveryAddress?.phone ||
        !deliveryAddress?.fullAddress ||
        !deliveryAddress?.city ||
        !deliveryAddress?.pincode ||
        !paymentMethod
    ) {
        const error = new Error('All fields are required: deliveryAddress (name, phone, fullAddress, city, pincode), paymentMethod');
        error.statusCode = 400;
        throw error;
    }

    // ── Get authenticated user's cart ────────────────────────────────────────
    const user = await User.findById(req.user._id).populate({
        path: 'cartItems.item',
        select: 'title price images category condition status seller',
    });

    const cartItems = user.cartItems.filter(
        (entry) => entry.item && entry.item.status === 'available'
    );

    if (cartItems.length === 0) {
        const error = new Error('Your cart is empty or all items have been sold');
        error.statusCode = 400;
        throw error;
    }

    // ── Loop through cart and create one order per item ──────────────────────
    const orders = [];
    const soldItemIds = [];

    for (const entry of cartItems) {
        const item = entry.item;

        // Skip own items silently
        if (item.seller.toString() === req.user._id.toString()) continue;

        // Calculate 10% commission
        const commission = Math.round(item.price * 0.10 * 100) / 100;

        const order = await Order.create({
            item: item._id,
            buyer: req.user._id,
            seller: item.seller,
            deliveryAddress,
            paymentMethod,
            price: item.price,
            commission,
            status: 'pending',
        });

        orders.push(order);
        soldItemIds.push(item._id);
    }

    if (orders.length === 0) {
        const error = new Error('No eligible items to order (you cannot buy your own listings)');
        error.statusCode = 400;
        throw error;
    }

    // ── Mark all ordered items as sold ───────────────────────────────────────
    await Item.updateMany(
        { _id: { $in: soldItemIds } },
        { status: 'sold' }
    );

    // ── Clear the user's cart AND save delivery address to profile ──────────
    user.cartItems = [];
    user.address = {
        fullAddress: deliveryAddress.fullAddress,
        city:        deliveryAddress.city,
        pincode:     deliveryAddress.pincode,
        // preserve landmark if already set
        landmark:    user.address?.landmark,
    };
    await user.save();

    // ── Return populated orders ─────────────────────────────────────────────
    const populated = await Order.find({ _id: { $in: orders.map((o) => o._id) } })
        .populate('item', 'title images category condition')
        .populate('buyer', '_id')
        .populate('seller', '_id');

    res.status(201).json({
        success: true,
        message: `${orders.length} order(s) placed successfully`,
        count: orders.length,
        data: populated,
        // Return updated address so caller can refresh AuthContext
        savedAddress: user.address,
    });
});

// ─── @desc    Get current user's orders ──────────────────────────────────────
// ─── @route   GET /api/orders/my ─────────────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
        .populate('item', 'title images price category condition status')
        .populate('seller', '_id')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
    });
});
