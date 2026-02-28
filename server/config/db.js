import mongoose from 'mongoose';

/**
 * connectDB
 * Establishes a connection to MongoDB using the MONGO_URI environment variable.
 * - Retries are handled automatically by Mongoose's built-in reconnect logic.
 * - Exits the process with a non-zero code if the initial connection fails,
 *   so the process manager (PM2, Docker, etc.) can restart the app.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These are the recommended production options for Mongoose 6+
            // (useNewUrlParser & useUnifiedTopology are true by default in Mongoose 7+,
            //  but kept explicit here for clarity and backward compatibility)
        });

        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1); // Exit immediately so the process manager can restart
    }
};

// Emit helpful messages on subsequent connection events
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected.');
});

export default connectDB;
