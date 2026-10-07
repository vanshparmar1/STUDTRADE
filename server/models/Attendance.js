import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provider',
            required: [true, 'Provider ID is required'],
            index: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer ID is required'],
            index: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        serviceType: {
            type: String,
            enum: ['mess', 'water'],
            required: [true, 'Service type is required (mess or water)'],
            default: 'mess',
        },
        mealType: {
            type: String,
            enum: ['lunch', 'dinner', 'water', 'none'],
            default: 'none',
        },
        dateStr: {
            type: String, // Format: YYYY-MM-DD e.g. "2026-10-07"
            required: [true, 'Date string is required'],
            index: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'delivered', 'not_delivered'],
            required: [true, 'Attendance status is required'],
            default: 'present',
        },
        notes: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound Unique Index: Prevents duplicate attendance records for same provider + customer + dateStr + serviceType + mealType
attendanceSchema.index(
    { provider: 1, customer: 1, dateStr: 1, serviceType: 1, mealType: 1 },
    { unique: true }
);

attendanceSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
