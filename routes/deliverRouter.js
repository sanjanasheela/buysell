const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/orders'); // adjust path to your Order model

router.get('/:sellerId', async (req, res) => {
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
      status: { $ne: 'completed' }  // Exclude pending orders
    });

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this seller' });
    }

    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
  

router.post('/complete', async (req, res) => {
    const { buyerId, sellerId, transactionId, totalAmount, otp } = req.body;
    console.log(transactionId);
    console.log('OTP from user:', otp); // might show "123456\n" or " 123456 "

    try {
      const txn = await Order.find({ transactionId });
      console.log(txn);
      console.log(txn[0].otpHash);
      console.log(otp);
      if (!txn) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      // Convert both to string and trim before comparing
      const storedOtp = String(txn[0].otpHash).trim();
      const receivedOtp = String(otp).trim();
  
      console.log('Stored OTP:', storedOtp);
      console.log('Received OTP:', receivedOtp);
  
      if (storedOtp !== receivedOtp) {
        return res.status(400).json({ message: 'Invalid transaction details or OTP' });
      }
  
      txn[0].status = 'completed';
      await txn[0].save();
  
      return res.json({ message: 'Transaction completed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
module.exports = router;
