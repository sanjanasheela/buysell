const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now }
});

// ✅ Compound unique index
// cartSchema.index({ userId: 1, sellerId: 1 }, { unique: true });

const CartModel = mongoose.model("carts", cartSchema);
module.exports = CartModel;