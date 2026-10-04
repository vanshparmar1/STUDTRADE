import Order from '../models/Order.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Create orders from the user's cart ─────────────────────────────
// ─── @route   POST /api/orders ───────────────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
    const { deliveryAddress, paymentMethod = 'COD', itemId, item: directItemId } = req.body;

    // ── Get authenticated user ───────────────────────────────────────────────
    const user = await User.findById(req.user._id).populate({
        path: 'cartItems.item',
        select: 'title price images category condition status seller',
    });

    // ── Fallback address properties if incomplete ───────────────────────────
    const finalAddress = {
        name: deliveryAddress?.name || user.name || 'Student Buyer',
        phone: deliveryAddress?.phone || user.phone || '9999999999',
        fullAddress: deliveryAddress?.fullAddress || user.address?.fullAddress || 'Campus Hostel / Room',
        city: deliveryAddress?.city || user.address?.city || 'Campus Town',
        pincode: deliveryAddress?.pincode || user.address?.pincode || '395007',
    };

    let itemsToProcess = [];

    // ── 1. Check cart items ──────────────────────────────────────────────────
    const cartItems = user.cartItems.filter(
        (entry) => entry.item && entry.item.status === 'available'
    );

    if (cartItems.length > 0) {
        itemsToProcess = cartItems.map((entry) => entry.item);
    } else {
        // ── 2. Check direct itemId fallback ──────────────────────────────────
        const singleId = itemId || directItemId;
        if (singleId) {
            const singleItem = await Item.findById(singleId);
            if (singleItem && singleItem.status === 'available') {
                itemsToProcess = [singleItem];
            }
        }
    }

    if (itemsToProcess.length === 0) {
        const error = new Error('No available items to order. Please add items to your cart.');
        error.statusCode = 400;
        throw error;
    }

    // ── Loop through items and create order documents in MongoDB ───────────
    const orders = [];
    const soldItemIds = [];

    for (const item of itemsToProcess) {
        // Skip own items
        if (item.seller && item.seller.toString() === req.user._id.toString()) continue;

        const commission = Math.round(item.price * 0.10 * 100) / 100;

        const order = await Order.create({
            item: item._id,
            buyer: req.user._id,
            seller: item.seller || req.user._id,
            deliveryAddress: finalAddress,
            paymentMethod: paymentMethod || 'COD',
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

    // ── Clear cart and update user profile address ─────────────────────────
    user.cartItems = [];
    user.address = {
        fullAddress: finalAddress.fullAddress,
        city: finalAddress.city,
        pincode: finalAddress.pincode,
        landmark: user.address?.landmark,
    };
    await user.save();

    // ── Return populated orders ─────────────────────────────────────────────
    const populated = await Order.find({ _id: { $in: orders.map((o) => o._id) } })
        .populate('item', 'title images category condition price')
        .populate('buyer', '_id name email')
        .populate('seller', '_id name email');

    res.status(201).json({
        success: true,
        message: `${orders.length} order(s) placed successfully and saved to MongoDB`,
        count: orders.length,
        data: populated,
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
