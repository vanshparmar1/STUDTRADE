import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './Counter.js';
import { ALLOWED_EMAIL_DOMAIN } from '../utils/emailDomain.js';


// ─── Schema Definition ────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },

        email: {
            type: String,
            required: [true, 'College email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [
                new RegExp(`^[^\\s@]+@${ALLOWED_EMAIL_DOMAIN.replace('.', '\\.')}$`, 'i'),
                `Only @${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`,
            ],
        },

        phone: {
            type: String,
            trim: true,
            default: null,
            validate: {
                validator(v) {
                    if (!v) return true;
                    return /^[6-9]\d{9}$/.test(v);
                },
                message: 'Please provide a valid 10-digit Indian mobile number',
            },
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },

        role: {
            type: String,
            enum: {
                values: ['user', 'admin', 'manager'],
                message: 'Role must be "user", "admin", or "manager"',
            },
            default: 'user',
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        emailOtp: {
            type: String,
            default: null,
            select: false,
        },

  emailOtpExpires: {
    type: Date,
    default: null,
    select: false,
},

emailOtpAttempts: {
    type: Number,
    default: 0,
    select: false,
},

        address: {
            fullAddress: {
                type: String,
                trim: true,
                maxlength: [300, 'Full address cannot exceed 300 characters'],
            },
            city: {
                type: String,
                trim: true,
                maxlength: [100, 'City cannot exceed 100 characters'],
            },
            pincode: {
                type: String,
                trim: true,
                validate: {
                    validator(v) {
                        return !v || /^\d{6}$/.test(v);
                    },
                    message: 'Pincode must be a 6-digit number',
                },
            },
            landmark: {
                type: String,
                trim: true,
                maxlength: [200, 'Landmark cannot exceed 200 characters'],
            },
        },

        savedItems: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
            }],
            default: [],
        },

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

        studtradeID: {
            type: String,
            unique: true,
            index: true,
            sparse: true,
        },
    },
    {
        timestamps: true,
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