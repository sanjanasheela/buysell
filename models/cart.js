const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // root seller id
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
});

// Ensure one cart per user per seller
cartSchema.index({ userId: 1, sellerId: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
