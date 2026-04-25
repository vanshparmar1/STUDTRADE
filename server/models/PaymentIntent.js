import mongoose from 'mongoose';

const paymentIntentSchema = new mongoose.Schema(
    {
        cashfreeOrderId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
            index: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expectedAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['created', 'paid', 'failed', 'expired'],
            default: 'created',
            index: true,
        },
        cashfreePaymentId: {
            type: String,
            default: null,
        },
        paidAt: {
            type: Date,
            default: null,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

paymentIntentSchema.index({ item: 1, status: 1, expiresAt: 1 });

paymentIntentSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const PaymentIntent = mongoose.model('PaymentIntent', paymentIntentSchema);

export default PaymentIntent;
