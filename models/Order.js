const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,      // snapshot in case menu changes
  price: Number,
  quantity: { type: Number, min: 1 },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Guest orders (not logged in)
  guestName:  { type: String },
  guestEmail: { type: String },
  guestPhone: { type: String },

  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },

  orderType: {
    type: String,
    enum: ['Pickup', 'Delivery', 'Dine In'],
    required: true,
  },
  preferredTime: { type: String },
  paymentMethod: {
    type: String,
    enum: ['Pay at Counter', 'Credit / Debit Card', 'Apple Pay / Google Pay'],
    default: 'Pay at Counter',
  },
  specialInstructions: { type: String },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
