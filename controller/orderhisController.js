const TransactionModel = require('../models/orders');

const listAllTheOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await TransactionModel.find({
      $or: [{ buyerid: userId }, { sellerid: userId }]
    })
      .populate('itemid')
      .populate('buyerid')
      .populate('sellerid');

    res.status(200).json({ message: 'Orders fetched successfully', orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

const addinorderlist = async (req, res) => {
  try {
    // Set or override sellerId before validation
    const defaultSellerId = "683334f509c3a6fda1ef4160"; // Replace with actual ObjectId
    req.body.sellerId = req.body.sellerId || defaultSellerId;

    // Validate modified body
    const { isValid, errors } = validateOrderData(req.body);
    console.log(errors);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const newOrder = new OrderModel(req.body);
    await newOrder.save();

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { listAllTheOrders,addinorderlist };
