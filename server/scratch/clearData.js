import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../config/db.js';
import Need from '../models/Need.js';
import Study from '../models/Study.js';
import CampusUpdate from '../models/CampusUpdate.js';
import Service from '../models/Service.js';

const clearAllData = async () => {
    try {
        await connectDB();
        console.log('Clearing all previous data for Need, Study, CampusUpdate, and Service collections...');

        const needResult = await Need.deleteMany({});
        console.log(`Deleted ${needResult.deletedCount} Need records`);

        const studyResult = await Study.deleteMany({});
        console.log(`Deleted ${studyResult.deletedCount} Study records`);

        const campusResult = await CampusUpdate.deleteMany({});
        console.log(`Deleted ${campusResult.deletedCount} CampusUpdate records`);

        const serviceResult = await Service.deleteMany({});
        console.log(`Deleted ${serviceResult.deletedCount} Service records`);

        console.log('✅ All previous data successfully wiped from MongoDB database!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing data:', err);
        process.exit(1);
    }
};

clearAllData();
