const mongoose = require('mongoose');

const orderItemSnapshot = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  base: { type: orderItemSnapshot, required: true },
  sauce: { type: orderItemSnapshot, required: true },
  cheese: { type: orderItemSnapshot, required: true },
  vegetables: [orderItemSnapshot],

  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },

  orderStatus: {
    type: String,
    enum: ['Order Received', 'In Kitchen', 'Sent to Delivery'],
    default: 'Order Received'
  }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
