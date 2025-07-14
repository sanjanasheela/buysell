const express = require('express');
const sellItemValidation = require('../middlewares/sellAuth');
const router = express.Router();
const { allItems }  = require('../controller/sellcontroller')
const { sellItem } = require('../controller/sellcontroller'); // correct named import
const ItemModel = require('../models/sell'); 
const mongoose = require('mongoose');

router.post('/', sellItemValidation, sellItem);
router.get('/list',allItems);

router.put('/edit', async (req, res) => {
  const { id, orderedQuantity } = req.body;
  console.log("Received ID:", id);
  console.log("Is valid ObjectId?", mongoose.Types.ObjectId.isValid(id));

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const item = await ItemModel.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.sellquantity < orderedQuantity) {
      return res.status(400).json({ message: 'Not enough quantity available to fulfill the order' });
    }

    const newQuantity = item.sellquantity - orderedQuantity;

    if (newQuantity <= 0) {
      // Remove the item if quantity goes to zero or below
      await ItemModel.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Item quantity reached zero and was deleted' });
    } else {
      // Otherwise, just update the quantity
      const updatedItem = await ItemModel.findByIdAndUpdate(
        id,
        { $inc: { sellquantity: -orderedQuantity } },
        { new: true }
      );
      return res.status(200).json({ message: 'Item quantity updated', item: updatedItem });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





module.exports = router;
