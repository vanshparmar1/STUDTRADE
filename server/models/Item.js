import mongoose from 'mongoose';

// ─── Schema Definition ────────────────────────────────────────────────────────
const itemSchema = new mongoose.Schema(
    {
        // ── Core listing info ────────────────────────────────────────────────
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            default: 'Campus Post',
            maxlength: [120, 'Title cannot exceed 120 characters'],
        },

        description: {
            type: String,
            trim: true,
            default: 'Campus listing and post item.',
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },

        price: {
            type: Number,
            default: 0,
            min: [0, 'Price cannot be negative'],
        },

        // ── Classification ───────────────────────────────────────────────────
        category: {
            type: String,
            default: 'Other',
            enum: {
                values: ['Books', 'Cycles', 'Tech', 'Furniture', 'Housing', 'Need', 'Other'],
                message: 'Category must be Books, Cycles, Tech, Furniture, Housing, Need, or Other',
            },
        },

        condition: {
            type: String,
            default: 'Good',
            enum: {
                values: ['New', 'Like New', 'Good', 'Fair'],
                message: 'Condition must be New, Like New, Good, or Fair',
            },
        },

        // ── Media — Cloudinary URLs (Optional) ──────────────────────────────
        images: {
            type: [String],
            default: [],
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
                default: 'Main Campus',
                trim: true,
                maxlength: [300, 'Full address cannot exceed 300 characters'],
            },
            locality: {
                type: String,
                default: 'Main Campus',
                trim: true,
                maxlength: [120, 'Locality cannot exceed 120 characters'],
            },
            city: {
                type: String,
                trim: true,
                default: 'Campus',
                maxlength: [100, 'City cannot exceed 100 characters'],
            },
            pincode: {
                type: String,
                trim: true,
                default: '',
            },
            landmark: {
                type: String,
                trim: true,
                default: '',
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

        // ── Social Engagement (Likes & Comments stored in MongoDB) ───────────
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                userName: {
                    type: String,
                    default: 'Campus Member',
                },
                text: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true, // auto-manages createdAt & updatedAt
    }
);

/**
 * Public label for catalog cards — campus locality first (no city name).
 * Falls back to city · PIN for older listings without locality.
 */
itemSchema.virtual('listingArea').get(function listingAreaGetter() {
    const p = this.pickupAddress;
    if (!p) return null;
    const locality = (p.locality || '').trim();
    if (locality) return locality;
    const city = (p.city || '').trim();
    const pin = (p.pincode || '').trim();
    if (city && pin) return `${city} · ${pin}`;
    if (city) return city;
    if (pin) return `PIN ${pin}`;
    return null;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound index: most common query = "available items in a category, newest first"
// Covers:  ?status=available&category=Books&sort=-createdAt
// MongoDB uses left-prefix matching, so this also covers status-only queries.
itemSchema.index({ status: 1, category: 1, createdAt: -1 });

// Price-range filtering:  ?status=available&price[$gte]=100&price[$lte]=500
itemSchema.index({ status: 1, price: 1 });

// Text index for search:  ?q=macbook
itemSchema.index({ title: 'text', description: 'text' });

// ─── Sanitize JSON output (virtuals: true set on schema options) ──────────────
itemSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});
itemSchema.set('toObject', { virtuals: true });

const Item = mongoose.model('Item', itemSchema);

export default Item;
