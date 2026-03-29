import mongoose from 'mongoose';

// ─── Schema Definition ────────────────────────────────────────────────────────
const itemSchema = new mongoose.Schema(
    {
        // ── Core listing info ────────────────────────────────────────────────
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [120, 'Title cannot exceed 120 characters'],
        },

        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },

        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },

        // ── Classification ───────────────────────────────────────────────────
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: {
                values: ['Books', 'Cycles', 'Tech', 'Furniture', 'Other'],
                message: 'Category must be Books, Cycles, Tech, Furniture, or Other',
            },
        },

        condition: {
            type: String,
            required: [true, 'Condition is required'],
            enum: {
                values: ['New', 'Like New', 'Good', 'Fair'],
                message: 'Condition must be New, Like New, Good, or Fair',
            },
        },

        // ── Media — Cloudinary URLs ──────────────────────────────────────────
        images: {
            type: [String],
            validate: {
                validator: (arr) => arr.length > 0 && arr.length <= 5,
                message: 'Must have between 1 and 5 images',
            },
        },

        // ── Ownership ────────────────────────────────────────────────────────
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Seller is required'],
            index: true,
        },

        // ── Pickup location (seller's address for logistics) ────────────────
        pickupAddress: {
            fullAddress: {
                type: String,
                required: [true, 'Pickup full address is required'],
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

        // ── Lifecycle & Analytics ──────────────────────────────────────────
        status: {
            type: String,
            enum: {
                values: ['available', 'sold'],
                message: 'Status must be available or sold',
            },
            default: 'available',
        },

        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // auto-manages createdAt & updatedAt
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound index: most common query = "available items in a category, newest first"
// Covers:  ?status=available&category=Books&sort=-createdAt
// MongoDB uses left-prefix matching, so this also covers status-only queries.
itemSchema.index({ status: 1, category: 1, createdAt: -1 });

// Price-range filtering:  ?status=available&price[$gte]=100&price[$lte]=500
itemSchema.index({ status: 1, price: 1 });

// Text index for search:  ?q=macbook
itemSchema.index({ title: 'text', description: 'text' });

// ─── Sanitize JSON output ─────────────────────────────────────────────────────
itemSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
