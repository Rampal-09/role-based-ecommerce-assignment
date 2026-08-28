const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name snapshot is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price snapshot is required'],
      min: [0, 'Price snapshot must be greater than or equal to 0'],
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for order'],
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must contain at least one item'],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    razorpayOrderId: {
      type: String,
      default: null,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ 'items.seller': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
