// ─── Allowed origins ─────────────────────────────────────────────────────────
// FRONTEND_URL: comma- or newline-separated full origins (scheme + host, no path).
// Entries without a scheme get https:// (common mistake: studtrade.xyz vs https://studtrade.xyz).

const normalizeOrigin = (raw) => {
    let o = String(raw).trim().replace(/\/+$/, '');
    if (!o) return '';
    if (!/^https?:\/\//i.test(o)) {
        o = `https://${o}`;
    }
    return o;
};

const parseOriginsFromEnv = (value) =>
    String(value || '')
        .replace(/\r?\n/g, ',')
        .split(',')
        .map((o) => normalizeOrigin(o))
        .filter(Boolean);

const envOrigins = parseOriginsFromEnv(process.env.FRONTEND_URL);
const allowedOrigins = [...new Set(['http://localhost:5173', ...envOrigins])];

export const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            // !origin covers: server-to-server, curl, Postman, mobile apps
            callback(null, true);
        } else {
            console.warn(
                `[CORS] Blocked "${origin}". Add this exact origin to FRONTEND_URL on Railway (e.g. https://studtrade.xyz). ` +
                    `Allowed (${allowedOrigins.length}): ${allowedOrigins.join(', ')}`
            );
            // false = deny without throwing — avoids noisy 500s; browser still blocks until FRONTEND_URL is fixed.
            callback(null, false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};