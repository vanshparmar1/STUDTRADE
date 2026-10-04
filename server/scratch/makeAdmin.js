import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../config/db.js';
import User from '../models/User.js';

const emailArg = process.argv[2];

const promoteToAdmin = async () => {
    try {
        await connectDB();
        if (!emailArg) {
            const res = await User.updateMany({}, { role: 'admin' });
            console.log(`✅ Promoted ${res.modifiedCount} user(s) to 'admin' role!`);
        } else {
            const user = await User.findOneAndUpdate(
                { email: emailArg.toLowerCase().trim() },
                { role: 'admin' },
                { new: true }
            );
            if (!user) {
                console.error(`❌ User with email "${emailArg}" not found in database.`);
            } else {
                console.log(`✅ User ${user.email} (${user.name}) is now an ADMIN!`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating user role:', err);
        process.exit(1);
    }
};

promoteToAdmin();
