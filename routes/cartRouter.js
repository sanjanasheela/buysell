const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const Cart = require('../models/cart');
const Item = require('../models/sell');   // adjust if needed
const validateCartData = require('../middlewares/cartValidation');


// ✅ Get all carts for a user (grouped by seller)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const cartEntries = await Cart.find({ userId });

    if (!cartEntries || cartEntries.length === 0) {
      return res.status(404).json({ message: 'No cart items found for this user.' });
    }

    const carts = cartEntries.map(entry => ({
      sellerId: entry.sellerId,
      items: entry.items || []
    }));

    res.status(200).json({ userId, carts });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: 'Failed to fetch cart items for the user.' });
  }
});


// ✅ Add an item to cart
router.post('/', async (req, res) => {
  try {
    const { userId, sellerId, itemId, quantity, name, price } = req.body;

    if (!sellerId || sellerId === 'null' || sellerId === null) {
      return res.status(400).json({ message: 'sellerId is required and cannot be null.' });
    }

    // Validate request body
    const { isValid, errors } = validateCartData({ userId, sellerId, itemId, quantity, name, price });
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // 1. Check if item exists for that seller
    const item = await Item.findOne({ _id: itemId, sellerid: sellerId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found for this seller' });
    }

    const requestedQty = Number(quantity) || 1;

    // 2. Find cart for this user + seller
    let cart = await Cart.findOne({ userId, sellerId });

    let existingQty = 0;
    if (cart) {
      const existingItem = cart.items.find(i => i.itemId.toString() === itemId.toString());
      if (existingItem) existingQty = existingItem.quantity;
    }

    const totalRequested = existingQty + requestedQty;

    if (totalRequested > item.sellquantity) {
      return res.status(400).json({
        message: `Only ${item.sellquantity - existingQty} more unit(s) available in stock`,
      });
    }

    // 3. Create new cart or update existing one
    if (!cart) {
      cart = new Cart({
        userId,
        sellerId,
        items: [{
          sellerId,
          itemId,
          name,
          price,
          quantity: requestedQty,
        }],
        createdAt: Date.now(),
      });
    } else {
      const existingItemIndex = cart.items.findIndex(i => i.itemId.toString() === itemId.toString());
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += requestedQty;
      } else {
        cart.items.push({
          sellerId,
          itemId,
          name,
          price,
          quantity: requestedQty,
        });
      }
    }

    await cart.save();
    res.status(201).json(cart);

  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ✅ Remove single item from a user’s cart
router.delete('/:userId/remove/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user.' });
    }

    const originalCount = cart.items.length;
    cart.items = cart.items.filter(i => i.itemId.toString() !== itemId.toString());

    if (cart.items.length === originalCount) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    await cart.save();

    res.status(200).json({ message: 'Item removed successfully', cart });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Clear all carts for a user
router.delete("/:userId/clear", async (req, res) => {
  const { userId } = req.params;

  try {
    const buyerObjectId = new mongoose.Types.ObjectId(userId);
    const carts = await Cart.find({ userId: buyerObjectId });

    if (!carts || carts.length === 0) {
      return res.status(404).json({ message: "No carts found for user" });
    }

    for (const cart of carts) {
      await cart.deleteOne();
    }

    res.status(200).json({ message: "Carts deleted successfully" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
