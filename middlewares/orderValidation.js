const mongoose = require('mongoose');


function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateOrderData(orderData) {
  const errors = {};

  // Check transactionId
  if (!orderData.transactionId || typeof orderData.transactionId !== "string") {
    errors.transactionId = "Transaction ID is required and must be a string.";
  }

  // Check buyerId
  if (!orderData.buyerId || !isValidObjectId(orderData.buyerId)) {
    errors.buyerId = "Valid buyerId is required.";
  }

  
  

  // Validate items array
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.items = "At least one item is required.";
  } else {
    orderData.items.forEach((item, index) => {
      
      // Check sellerId
  if (!item.sellerId || !isValidObjectId(item.sellerId)) {
    errors.sellerId = "Valid sellerId is required.";
  }
      if (!item.itemId || !isValidObjectId(item.itemId)) {
        errors[`items[${index}].itemId`] = "Valid itemId is required.";
      }
      if (!item.name || typeof item.name !== "string") {
        errors[`items[${index}].name`] = "Item name must be a string.";
      }
      if (typeof item.price !== "number" || item.price < 0) {
        errors[`items[${index}].price`] = "Price must be a non-negative number.";
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        errors[`items[${index}].quantity`] = "Quantity must be a positive number.";
      }
    });
  }

  // Validate totalAmount
  const calculatedTotal = (orderData.items || []).reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  if (typeof orderData.totalAmount !== "number" || orderData.totalAmount < 0) {
    errors.totalAmount = "totalAmount must be a non-negative number.";
  } else if (orderData.totalAmount !== calculatedTotal) {
    errors.totalAmount = `totalAmount (${orderData.totalAmount}) does not match the sum of items (${calculatedTotal}).`;
  }


  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}


module.exports = validateOrderData;
