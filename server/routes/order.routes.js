import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createOrder, getMyOrders } from '../controllers/order.controller.js';

const router = Router();

// All order routes are protected
router.use(protect);

// POST /api/orders    — Create orders from cart
router.post('/', createOrder);

// GET /api/orders/my  — Get all orders for the current user
router.get('/my', getMyOrders);

export default router;
