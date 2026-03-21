import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
} from '../controllers/cart.controller.js';

const router = Router();

// All cart routes are protected — must be logged in
router.use(protect);

// GET  /api/cart          — get current user's cart
router.get('/', getCart);

// POST /api/cart/add      — add item (or increment quantity if already in cart)
router.post('/add', addToCart);

// DELETE /api/cart/clear  — clear entire cart
router.delete('/clear', clearCart);

// DELETE /api/cart/:itemId — remove specific item from cart
router.delete('/:itemId', removeFromCart);

export default router;
