import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Service title is required'],
            trim: true,
            maxlength: [150, 'Title cannot exceed 150 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            required: true,
            default: 'Mess / Tiffin',
        },
        price: {
            type: Number,
            default: 0,
            min: [0, 'Price cannot be negative'],
        },
        priceUnit: {
            type: String,
            default: '/month',
            trim: true,
        },
        contactPhone: {
            type: String,
            default: '',
            trim: true,
        },
        location: {
            type: String,
            default: 'Campus Area',
            trim: true,
        },
        images: {
            type: [String],
            default: [],
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        providerName: {
            type: String,
            default: 'Verified Provider',
        },
        status: {
            type: String,
            enum: ['available', 'unavailable'],
            default: 'available',
        },
    },
    {
        timestamps: true,
    }
);

serviceSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
