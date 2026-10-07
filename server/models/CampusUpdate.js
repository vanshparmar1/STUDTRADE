import mongoose from 'mongoose';

const campusUpdateSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            default: '',
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            default: 'Announcement',
            trim: true,
        },
        location: {
            type: String,
            default: 'Campus',
            trim: true,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hrs
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: {
            type: String,
            default: 'Verified Student',
        },
    },
    {
        timestamps: true,
    }
);

campusUpdateSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const CampusUpdate = mongoose.model('CampusUpdate', campusUpdateSchema);
export default CampusUpdate;
