import mongoose from 'mongoose';

/**
 * Resolve Atlas / Mongo connection string from env.
 * Railway, Atlas UI, and various templates use different variable names.
 */
const resolveMongoUri = () => {
    const candidates = [
        process.env.MONGO_URI,
        process.env.MONGODB_URI,
        process.env.DATABASE_URL,
        process.env.MONGO_URL,
    ];
    for (const c of candidates) {
        if (typeof c === 'string' && c.trim().length > 0) {
            return c.trim();
        }
    }
    return null;
};

/** Optional default DB when URI has no path (e.g. …mongodb.net/?appName=…) — avoids using Atlas `test` by mistake. */
const resolveDbName = () => {
    const n = process.env.MONGO_DB_NAME?.trim();
    return n || undefined;
};

/**
 * connectDB
 * Establishes a connection to MongoDB.
 * - Retries are handled automatically by Mongoose's built-in reconnect logic.
 * - Exits the process with a non-zero code if the initial connection fails,
 *   so the process manager (PM2, Docker, Railway, etc.) can restart the app.
 */
const connectDB = async () => {
    const uri = resolveMongoUri();
    if (!uri) {
        console.error(
            '❌ MongoDB: no connection string. Set one of MONGO_URI, MONGODB_URI, DATABASE_URL, or MONGO_URL (Railway → Variables).'
        );
        process.exit(1);
    }

    try {
        const dbName = resolveDbName();
        const conn = await mongoose.connect(uri, dbName ? { dbName } : {});

        const host = conn.connection.host || 'unknown host';
        const name = conn.connection.name || 'default';
        console.log(`✅ MongoDB connected (${host}) db="${name}"${dbName ? ' (from MONGO_DB_NAME)' : ''}`);
    } catch (error) {
        console.error(`❌ MongoDB connection failed: ${error.message}`);
        console.error(
            '   Check: (1) variable name matches one of MONGO_URI / MONGODB_URI / DATABASE_URL / MONGO_URL, ' +
                '(2) Atlas Network Access allows 0.0.0.0/0 (or Railway egress), (3) user/password and DB name in the URI.'
        );
        process.exit(1);
    }
};

// Emit helpful messages on subsequent connection events
mongoose.connection.on('disconnected', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    }
});

mongoose.connection.on('reconnected', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 MongoDB reconnected.');
    }
});

export default connectDB;
