import mongoose from 'mongoose';

const needSchema = new mongoose.Schema(
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
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            default: 'Item Needed',
            enum: [
                'Item Needed',
                'Service Needed',
                'Skill Needed',
                'Study Help',
                'Rental Needed',
                'Urgent Need',
                'Paid Opportunity',
                'Free / Borrow',
                'Urgent Sale',
                'Other',
            ],
        },
        budget: {
            type: String,
            default: 'Flexible',
            trim: true,
        },
        location: {
            type: String,
            default: 'Campus Area',
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userName: {
            type: String,
            default: 'Student',
        },
        userEmail: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'FULFILLED', 'EXPIRED'],
            default: 'ACTIVE',
        },
    },
    {
        timestamps: true,
    }
);

needSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Need = mongoose.model('Need', needSchema);
export default Need;
