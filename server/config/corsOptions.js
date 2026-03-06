// ─── Allowed origins ─────────────────────────────────────────────────────────
// In production, set FRONTEND_URL to your deployed frontend domain.
// Multiple origins can be comma-separated: "https://a.com,https://b.com"
const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

export const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (!origin && process.env.NODE_ENV !== 'production') {
            // Allow curl/Postman/mobile in development only
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: Origin "${origin}" is not allowed.`));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};
