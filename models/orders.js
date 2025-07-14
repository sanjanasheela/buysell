const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const OrderSchema = new Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
 
  items: {
    type: [ItemSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  otpHash: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  }
}, { timestamps: true });

const OrderModel = mongoose.model("orders", OrderSchema);
module.exports = OrderModel;
