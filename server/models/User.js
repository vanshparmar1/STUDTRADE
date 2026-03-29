import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './Counter.js';


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
                values: ['user', 'admin', 'manager'],
                message: 'Role must be "user", "admin", or "manager"',
            },
            default: 'user',
        },

        // ── Saved / Wishlist items
        savedItems: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
            }],
            default: [],
        },

        // ── Cart items
        cartItems: {
            type: [
                {
                    item: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Item',
                        required: true,
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: [1, 'Quantity must be at least 1'],
                        default: 1,
                    },
                },
            ],
            default: [],
        },

        // ── Platform-specific unique identifier (auto-generated, immutable)
        studtradeID: {
            type: String,
            unique: true,
            index: true,
            sparse: true,
        },
    },
    {
        timestamps: true, // auto-manages createdAt & updatedAt
    }
);

// ─── Pre-save: auto-generate studtradeID on first save & hash password ────────
userSchema.pre('save', async function () {
    // Generate studtradeID only on document creation
    if (this.isNew && !this.studtradeID) {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'studtradeID' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        // e.g. ST-0001
        this.studtradeID = `ST-${String(counter.seq).padStart(4, '0')}`;
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
