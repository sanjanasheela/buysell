const router = require('express').Router();
const Order = require('../models/orders'); // Adjust path as needed
const  validateOrderData  = require('../middlewares/orderValidation'); // Adjust path as needed
const mongoose = require('mongoose');


router.post('/', async (req, res) => {
  console.log('received the request for orders');

  // const defaultSellerId = "683334f509c3a6fda1ef4160"; // Replace with actual ObjectId
  // req.body.sellerId = req.body.sellerId || defaultSellerId;

  const { isValid, errors } = validateOrderData(req.body);
console.log(req.body);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  console.log('validated');

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Ideally hash this OTP before saving, but for demo:
  req.body.otpHash = otp; // temporarily storing plain otp for demo

  console.log("Generated OTP:", otp);

  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    // Send OTP along with response to frontend
    res.status(201).json({
      message: 'Order created successfully!',
      order: newOrder,
      otp: otp // <-- send this OTP to frontend
    });
  } catch (err) {
    console.error('Error saving order:', err.message);
    console.error('Full error object:', err);
    res.status(500).json({ error: err.message, details: err });
  }
});

// GET orders for a specific buyer by buyerId
router.get('/:buyerId', async (req, res) => {
  const buyerId = req.params.buyerId;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    return res.status(400).json({ error: 'Invalid buyer ID' });
  }

  try {
    // Find all orders where buyerId matches
    const orders = await Order.find({ buyerId });

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this buyer' });
    }
    console.log(orders);
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/seller/:sellerId', async (req, res) => {
  const sellerId = req.params.sellerId;

  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    return res.status(400).json({ error: 'Invalid seller ID' });
  }

  try {
    const orders = await Order.find({
      items: {
        $elemMatch: {
          sellerId: sellerId
        }
      },
      status: { $ne: 'pending' }  // Exclude pending orders
    });

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this seller' });
    }

    // Optional: filter items to include only those belonging to this seller
    const filteredOrders = orders.map(order => {
      const filteredItems = order.items.filter(item => item.sellerId.toString() === sellerId);
      return {
        ...order.toObject(),
        items: filteredItems
      };
    });

    res.json({ orders: filteredOrders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


module.exports = router;
