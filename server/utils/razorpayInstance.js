/**
 * Razorpay SDK Singleton
 *
 * Initialises a single Razorpay instance using environment credentials.
 * Import this wherever you need to interact with the Razorpay API.
 *
 * Required env vars:
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 */

import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpayInstance;
