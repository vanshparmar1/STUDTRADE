import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './Counter.js';

// ─── Helper: generate sequential STUDTRADE ID (race-condition safe) ──────────
// Uses an atomic findOneAndUpdate + $inc on a dedicated Counter collection.
// Format: ST-0001, ST-0002, ... ST-9999, ST-10000 (unbounded)
const getNextStudtradeID = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: 'studtradeID' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return `ST-${counter.seq.toString().padStart(4, '0')}`;
};


// ─── Schema Definition ────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
    {
        // ── Identity
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },

        // ── College email — restricted to @iiitbhopal.ac.in
        email: {
            type: String,
            required: [true, 'College email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@iiitbhopal\.ac\.in$/,
                'Only @iiitbhopal.ac.in email addresses are allowed',
            ],
        },

        // ── Phone — optional, Indian mobile number (10 digits, starts with 6-9)
        phone: {
            type: String,
            trim: true,
            default: null,
            validate: {
                validator(v) {
                    // Allow null/empty (optional field), but reject malformed values
                    if (!v) return true;
                    return /^[6-9]\d{9}$/.test(v);
                },
                message: 'Please provide a valid 10-digit Indian mobile number',
            },
        },

        // ── Password — excluded from all query results by default
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },

        // ── Role-based access control
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: 'Role must be either "user" or "admin"',
            },
            default: 'user',
        },

        // ── KYC / Student Verification ───────────────────────────────────────

        // Boolean fast-access flag — kept in sync with verificationStatus
        isVerified: {
            type: Boolean,
            default: false,
        },

        // Cloudinary URL of the uploaded KYC document (student ID, etc.)
        kycDocument: {
            type: String,
            default: null,
        },

        // Verification lifecycle status
        verificationStatus: {
            type: String,
            enum: {
                values: ['pending', 'approved', 'rejected'],
                message: 'verificationStatus must be pending, approved, or rejected',
            },
            default: 'pending',
        },

        // Timestamp of when the admin approved/rejected
        verifiedAt: {
            type: Date,
            default: null,
        },

        // Admin who approved/rejected — references the User collection itself
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        // ── Platform-specific unique identifier (auto-generated, immutable)
        studtradeID: {
            type: String,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true, // auto-manages createdAt & updatedAt
    }
);

// ─── Pre-save: auto-generate studtradeID on first save ───────────────────────
userSchema.pre('save', async function () {
    // Generate studtradeID only on document creation
    if (this.isNew) {
        this.studtradeID = await getNextStudtradeID();
    }

    // Only re-hash if password field was actually modified
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance method: compare plain-text password with stored hash ────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// ─── Sanitize output: strip __v from toJSON responses ────────────────────────
userSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const User = mongoose.model('User', userSchema);

export default User;
