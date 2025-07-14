const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');  // adjust path if needed
const validateCartData = require('../middlewares/cartValidation');
const mongoose = require("mongoose");
const Item = require('../models/sell');
// Get cart by userId (returns the entire cart document with items array)
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const cartEntries = await Cart.find({ userId });
// console.log(cartEntries);
    if (!cartEntries || cartEntries.length === 0) {
      return res.status(404).json({ message: 'No cart items found for this user.' });
    }

    const carts = cartEntries.map(entry => ({
      // sellerId: entry.sellerId,
      items: entry.items || []
    }));

    res.status(200).json({ userId, carts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cart items for the user.' });
  }
});



router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const { userId, sellerId, itemId, quantity, name, price } = req.body;

    // Validate input
    const { isValid, errors } = validateCartData({ userId, sellerId, itemId, quantity, name, price });
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    console.log('validated cart');

    // 1. Check item availability
    const item = await Item.findOne({ _id: itemId, sellerid:sellerId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found for this seller' });
    }

    const requestedQty = quantity || 1;

    // 2. Check existing cart to sum existing quantity (if present)
    let cart = await Cart.findOne({ userId });
console.log(item);
console.log(cart);
    let existingQty = 0;

    if (cart) {
      const existingItem = cart.items.find(
        (i) => i.itemId.toString() === itemId.toString()
      );
      if (existingItem) {
        existingQty = existingItem.quantity;
      }
    }
console.log(existingQty);
    const totalRequested = existingQty + requestedQty;
    console.log(totalRequested);
    if (totalRequested > item.sellquantity) {
      return res.status(400).json({
        message: `Only ${item.quantity - existingQty} more unit(s) available in stock`,
      });
    }

    // 3. Create or update cart
    if (!cart) {
      cart = new Cart({
        userId,
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
      const existingItemIndex = cart.items.findIndex(
        (item) => item.itemId.toString() === itemId.toString()
      );

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
    res.status(500).json({ message: 'Server error' });
  }
});



// Remove item from cart
router.delete('/:userId/remove/:itemId', async (req, res) => {
  try {
    console.log('got the request');
    const { userId, itemId } = req.params;
    console.log(userId,itemId);

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user.' });
    }

    // Filter out the item to remove
    const originalItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.itemId.toString() !== itemId.toString()
    );

    if (cart.items.length === originalItemCount) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    await cart.save();

    res.status(200).json({
      message: 'Item removed from cart successfully.',
      cart,
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


  router.delete("/:userId/clear", async (req, res) => {
    const { userId } = req.params;
  
    console.log("Hit DELETE /cart/:userId/clear with userId:", userId);
  
    try {
      const buyerObjectId = new mongoose.Types.ObjectId(userId);
  
      // ❗ Use correct field: userId
      const carts = await Cart.find({ userId: buyerObjectId });
  
      if (!carts || carts.length === 0) {
        return res.status(404).json({ message: "No carts found for user" });
      }
  
      for (const cart of carts) {
        await cart.deleteOne(); // delete the whole cart document
      }
  
      res.status(200).json({ message: "Carts deleted successfully" });
    } catch (err) {
      console.error("Error clearing cart:", err);
      res.status(500).json({ message: "Internal server error", error: err.message });
    }
  });

module.exports = router;