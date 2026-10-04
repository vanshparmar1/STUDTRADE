import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../config/db.js';
import User from '../models/User.js';

const listUsers = async () => {
    try {
        await connectDB();
        const users = await User.find({}, 'name email role isEmailVerified createdAt').sort({ createdAt: -1 });
        console.log(`Found ${users.length} registered users:`);
        users.forEach((u) => {
            console.log(`- ${u.name} (${u.email}) -> Role: ${u.role} | Verified: ${u.isEmailVerified}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('❌ Error listing users:', err);
        process.exit(1);
    }
};

listUsers();
