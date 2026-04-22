import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

const READY_LABELS = ['disconnected', 'connected', 'connecting', 'disconnecting'];

/**
 * GET /api/health
 * Public health check — process is up and whether Mongoose sees an active DB socket.
 */
router.get('/', (req, res) => {
    const ready = mongoose.connection.readyState;
    res.status(200).json({
        success: true,
        message: 'Server is up and running 🚀',
        db: READY_LABELS[ready] ?? 'unknown',
        dbReady: ready === 1,
        timestamp: new Date().toISOString(),
    });
});

export default router;
