import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../config/db.js';
import User from '../models/User.js';

const targetEmail = process.argv[2] || '24u010069@iiitbhopal.ac.in';

const setSingleAdmin = async () => {
    try {
        await connectDB();
        
        // Reset all users to 'user' role
        await User.updateMany({}, { role: 'user' });

        // Set target email to 'admin'
        const user = await User.findOneAndUpdate(
            { email: targetEmail.toLowerCase().trim() },
            { role: 'admin' },
            { returnDocument: 'after' }
        );

        if (!user) {
            console.error(`❌ Target user with email "${targetEmail}" not found.`);
        } else {
            console.log(`✅ Successfully set ONLY "${user.email}" (${user.name}) as ADMIN! All other users are standard users.`);
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error setting single admin:', err);
        process.exit(1);
    }
};

setSingleAdmin();
