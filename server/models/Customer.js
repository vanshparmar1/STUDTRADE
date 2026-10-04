import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provider',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProviderService',
            default: null,
        },
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        contact: {
            type: String,
            required: [true, 'Contact number is required'],
            trim: true,
        },
        serviceName: {
            type: String,
            default: 'General Service',
            trim: true,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ['Requested', 'Active', 'Completed', 'Inactive'],
            default: 'Active',
        },
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

customerSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
