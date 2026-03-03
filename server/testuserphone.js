import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import User from './models/User.js';
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studtrade').then(async () => {
    try {
        const u = await User.findOne({email: '24u010002@iiitbhopal.ac.in'});
        console.log("Phone is:", u.phone);
    } catch(e) {
      console.log(e);
    }
    process.exit();
});
