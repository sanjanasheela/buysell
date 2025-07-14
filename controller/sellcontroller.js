const ItemModel = require('../models/sell');

const sellItem = async (req, res) => {
  try {

    const { itemname, price, description, category, sellerid, sellquantity } = req.body;

    
   
    // const sellerid = req.user._id;

    const newItem = new ItemModel({
      itemname,
      price,
      description,
      category,
      sellerid,
      sellquantity,
    });
    console.log(newItem);

    await newItem.save();
    res.status(201).json({ message: 'Item listed successfully', item: newItem });
  } catch (error) {
    res.status(500).json({ message: 'Error listing item', error: error.message });
  }
};

const allItems = async (req, res) => {
  try {
    const items = await ItemModel.find(); // gets all items from MongoDB
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
};


module.exports = { sellItem, allItems };
