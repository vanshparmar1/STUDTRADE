import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

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
import paymentRouter from './routes/payment.routes.js';
import needRouter from './routes/need.routes.js';
import studyRouter from './routes/study.routes.js';
import campusRouter from './routes/campus.routes.js';
import serviceRouter from './routes/service.routes.js';
import providerRouter from './routes/provider.routes.js';
import attendanceRouter from './routes/attendance.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Handle unhandled rejections globally so process doesn't crash silently
process.on('unhandledRejection', (reason, promise) => {
    console.warn('⚠️  Unhandled Promise Rejection caught:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌  Uncaught Exception caught:', err);
});

// One reverse proxy (Railway, Render, etc.) — correct client IP for rate limits and logs.
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Railway / Render / Fly inject PORT — the app must listen on that value (not a fixed 5000).
const parsedPort = Number(process.env.PORT);
const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5000;

if (process.env.RAILWAY_ENVIRONMENT && String(process.env.PORT) === '5000') {
    console.warn(
        '⚠️  Railway: PORT is set to 5000. If your public URL returns 502, delete the PORT variable in Railway ' +
            '(Variables) so the platform can set PORT to match networking (often 8080).'
    );
}

// ─── Security Middleware ───────────────────────────────────────────────────────
// CORP defaults to "same-origin" and breaks browser XHR/fetch when the SPA is on
// another host (e.g. Vercel → Railway). "cross-origin" is correct for a public API.
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);
app.use(cors(corsOptions));               // Restrict origins to FRONTEND_URL env var
app.use(generalLimiter);                  // Global: 200 req / 15 min per IP

// ─── Static File Serving (Uploads Fallback) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ success: true, message: 'StudTrade Backend API is running' });
});

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
app.use('/api/payment', paymentRouter);
app.use('/api/needs', needRouter);
app.use('/api/study', studyRouter);
app.use('/api/campus-updates', campusRouter);
app.use('/api/services', serviceRouter);
app.use('/api/provider', providerRouter);
app.use('/api/attendance', attendanceRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
// Connect to DB first; only start the HTTP server after the connection is live.
(async () => {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
        const env = process.env.NODE_ENV || 'development';
        console.log(`✅ HTTP listening on 0.0.0.0:${PORT} [NODE_ENV=${env}]`);
        if (env !== 'production') {
            console.warn('   Tip: set NODE_ENV=production on Railway for production behaviour.');
        }
    });
})();

export default app;

