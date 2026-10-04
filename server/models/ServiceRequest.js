import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provider',
            required: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProviderService',
            default: null,
        },
        studentName: {
            type: String,
            required: [true, 'Student name is required'],
            trim: true,
        },
        studentContact: {
            type: String,
            required: [true, 'Student contact is required'],
            trim: true,
        },
        serviceTitle: {
            type: String,
            default: 'General Service Request',
        },
        message: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Requested', 'Accepted', 'Rejected', 'Completed'],
            default: 'Requested',
        },
    },
    {
        timestamps: true,
    }
);

serviceRequestSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;
