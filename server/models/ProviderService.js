import mongoose from 'mongoose';

const providerServiceSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provider',
            required: true,
        },
        type: {
            type: String,
            required: [true, 'Provider type is required'],
            default: 'Mess / Tiffin',
        },
        title: {
            type: String,
            required: [true, 'Service/Product title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        price: {
            type: Number,
            default: 0,
            min: [0, 'Price cannot be negative'],
        },
        pricingDetails: {
            dailyPrice: { type: Number, default: 0 },
            monthlyPrice: { type: Number, default: 0 },
            perMealPrice: { type: Number, default: 0 },
            vegNonVeg: { type: String, default: 'Veg' },
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            servingTime: { type: String, default: '' },
            duration: { type: String, default: '' },
            condition: { type: String, default: 'Good' },
            deliveryInfo: { type: String, default: '' },
        },
        schedule: {
            type: String,
            default: '',
        },
        availability: {
            type: String,
            default: 'Available',
        },
        status: {
            type: String,
            enum: ['active', 'hidden', 'deleted'],
            default: 'active',
        },
        images: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

providerServiceSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const ProviderService = mongoose.model('ProviderService', providerServiceSchema);
export default ProviderService;
