import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        offerText: {
            type: String,
            default: 'SPECIAL OFFER',
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: ['Offer', 'News', 'Announcement', 'Service'],
            default: 'Offer',
        },
        buttonText: {
            type: String,
            default: 'Explore Now',
            trim: true,
        },
        buttonLink: {
            type: String,
            default: '/marketplace',
            trim: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

promotionSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
