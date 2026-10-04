import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        businessName: {
            type: String,
            required: [true, 'Business/Service name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Mobile number is required'],
            trim: true,
        },
        whatsapp: {
            type: String,
            default: '',
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        openingHours: {
            type: String,
            default: '8:00 AM - 10:00 PM',
            trim: true,
        },
        providerTypes: {
            type: [String],
            required: [true, 'At least one provider type is required'],
            default: [],
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'suspended'],
            default: 'pending',
        },
        profileImage: {
            type: String,
            default: '',
        },
        todayMenu: {
            vegNonVeg: { type: String, default: 'Veg & Non-Veg' },
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            servingTime: { type: String, default: '8 AM - 10 PM' },
            updatedAt: { type: Date, default: Date.now },
        },
        quickNotes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

providerSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Provider = mongoose.model('Provider', providerSchema);
export default Provider;
