import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Public health check endpoint — used by load balancers & monitoring tools.
 */
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is up and running 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

export default router;
