const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  itemname: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: [String], // multiple categories
  sellerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sellquantity:{
    type: Number,
    required: true,
  },
});

const ItemModel = mongoose.model("items", ItemSchema);
module.exports = ItemModel;
