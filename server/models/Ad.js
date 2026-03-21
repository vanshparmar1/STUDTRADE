import mongoose from 'mongoose';

const adSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Ad title is required'],
            trim: true,
            maxlength: [120, 'Title cannot exceed 120 characters'],
        },
        image: {
            type: String,
            required: [true, 'Ad image URL is required'],
        },
        link: {
            type: String,
            required: [true, 'Ad link is required'],
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Only return active ads by default
adSchema.index({ isActive: 1 });

const Ad = mongoose.model('Ad', adSchema);
export default Ad;
