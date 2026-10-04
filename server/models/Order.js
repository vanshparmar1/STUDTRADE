import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        // ── Referenced item
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: [true, 'Item is required'],
        },

        // ── Buyer (logged-in user who placed the order)
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Buyer is required'],
            index: true,
        },

        // ── Seller (owner of the item)
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Seller is required'],
            index: true,
        },

        // ── Delivery address (snapshot at order time — immutable)
        deliveryAddress: {
            name: {
                type: String,
                required: [true, 'Recipient name is required'],
                trim: true,
                maxlength: [100, 'Name cannot exceed 100 characters'],
            },
            phone: {
                type: String,
                required: [true, 'Phone number is required'],
                trim: true,
                validate: {
                    validator(v) {
                        return !v || /^\+?\d{7,15}$/.test(v.replace(/[\s-]/g, ''));
                    },
                    message: 'Please provide a valid mobile number',
                },
            },
            fullAddress: {
                type: String,
                required: [true, 'Full address is required'],
                trim: true,
                maxlength: [500, 'Address cannot exceed 500 characters'],
            },
            city: {
                type: String,
                required: [true, 'City is required'],
                trim: true,
                maxlength: [100, 'City cannot exceed 100 characters'],
            },
            pincode: {
                type: String,
                required: [true, 'Pincode is required'],
                trim: true,
                validate: {
                    validator(v) {
                        return !v || /^\d{4,8}$/.test(v.replace(/\s/g, ''));
                    },
                    message: 'Pincode must be a valid pincode',
                },
            },
        },

        // ── Payment
        paymentMethod: {
            type: String,
            required: [true, 'Payment method is required'],
            enum: {
                values: ['COD', 'UPI', 'Online'],
                message: 'Payment method must be COD, UPI, or Online',
            },
        },

        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },

        commission: {
            type: Number,
            default: 0,
            min: [0, 'Commission cannot be negative'],
        },

        // ── Cashfree payment tracking
        cashfreeOrderId: {
            type: String,
            default: null,
        },

        cashfreePaymentId: {
            type: String,
            default: null,
        },

        paymentStatus: {
            type: String,
            enum: {
                values: ['pending', 'paid', 'failed'],
                message: 'Payment status must be pending, paid, or failed',
            },
            default: 'pending',
        },

        // ── Order lifecycle
        status: {
            type: String,
            enum: {
                values: ['pending', 'confirmed', 'delivered', 'cancelled'],
                message: 'Status must be pending, confirmed, delivered, or cancelled',
            },
            default: 'pending',
        },
    },
    {
        timestamps: true, // auto createdAt + updatedAt
    }
);

// ── Strip __v from JSON responses ─────────────────────────────────────────────
orderSchema.set('toJSON', {
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
