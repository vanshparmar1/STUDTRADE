import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import connectDB from './config/db.js';
import { corsOptions } from './config/corsOptions.js';
import { generalLimiter, authLimiter } from './config/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';
import itemRouter from './routes/item.routes.js';
import userRouter from './routes/user.routes.js';
import reportRouter from './routes/report.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';
import adRouter from './routes/ad.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());                         // Sets 15+ secure HTTP response headers
app.use(cors(corsOptions));               // Restrict origins to FRONTEND_URL env var
app.use(generalLimiter);                  // Global: 200 req / 15 min per IP

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authLimiter, authRouter);   // Strict: 20 req / 15 min
app.use('/api/admin', adminRouter);
app.use('/api/items', itemRouter);
app.use('/api/users', userRouter);
app.use('/api/reports', reportRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/ads', adRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
// Connect to DB first; only start the HTTP server after the connection is live.
(async () => {
    await connectDB();
    app.listen(PORT, () => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
        }
    });
})();

export default app;
