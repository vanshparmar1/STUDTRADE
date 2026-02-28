const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
];

export const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: Origin "${origin}" is not allowed.`));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};
