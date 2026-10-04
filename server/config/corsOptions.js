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
        // Always allow in development, localhost, 127.0.0.1, or matched origins to prevent 403 CORS blocks
        if (
            !origin ||
            process.env.NODE_ENV !== 'production' ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1') ||
            allowedOrigins.includes(origin)
        ) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};