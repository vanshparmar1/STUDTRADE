// ─── Allowed origins ─────────────────────────────────────────────────────────
// Reads from FRONTEND_URL env var.  Multiple origins can be comma-separated.
// Always includes localhost for local development.
const envOrigins = process.env.FRONTEND_URL || '';
const allowedOrigins = [
    'http://localhost:5173',                        // Vite dev server
    ...envOrigins.split(',').map((o) => o.trim()),  // production / preview URLs
]
    .filter(Boolean)
    .map((o) => o.replace(/\/+$/, ''));              // strip trailing slashes — browsers never send them

export const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            // !origin covers: server-to-server, curl, Postman, mobile apps
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: Origin "${origin}" is not allowed.`));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};