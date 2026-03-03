import mongoose from 'mongoose';

// ─── Schema Definition ────────────────────────────────────────────────────────
const reportSchema = new mongoose.Schema(
    {
        // ── The item being reported
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: [true, 'Reported item is required'],
        },

        // ── The user who filed the report
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reporter is required'],
        },

        // ── Free-text reason provided by the reporter
        reason: {
            type: String,
            required: [true, 'A reason for the report is required'],
            trim: true,
            minlength: [10, 'Reason must be at least 10 characters'],
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },

        // ── Admin review lifecycle
        status: {
            type: String,
            enum: {
                values: ['pending', 'reviewed', 'dismissed'],
                message: 'Status must be pending, reviewed, or dismissed',
            },
            default: 'pending',
        },

        // ── Optional admin note added during review
        adminNote: {
            type: String,
            trim: true,
            default: null,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Admin dashboard: filter/sort by status quickly
reportSchema.index({ status: 1, createdAt: -1 });

// Look up all reports on a specific item
reportSchema.index({ item: 1 });

// Look up all reports filed by a specific user
reportSchema.index({ reportedBy: 1 });

// Prevent a user from reporting the same item more than once
reportSchema.index({ item: 1, reportedBy: 1 }, { unique: true });

// ─── Sanitize output ──────────────────────────────────────────────────────────
reportSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
