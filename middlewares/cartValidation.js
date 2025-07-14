const mongoose = require('mongoose');

function validateCartData(data) {
  const errors = [];

  // Convert IDs to trimmed strings for consistent validation
  const userId = data.userId?.toString().trim();
  const sellerId = data.sellerId?.toString().trim();
  const itemId = data.itemId?.toString().trim();
  const quantity = data.quantity;

  // Validate userId
  if (!userId) {
    errors.push('User ID is required.');
  } else if (!mongoose.Types.ObjectId.isValid(userId)) {
    errors.push('User ID is not valid.');
  }

  // Validate sellerId
  if (!sellerId) {
    errors.push('Seller ID is required.');
  } else if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    errors.push('Seller ID is not valid.');
  }

  // Prevent user from buying their own product
  if (
    mongoose.Types.ObjectId.isValid(userId) &&
    mongoose.Types.ObjectId.isValid(sellerId) &&
    userId === sellerId
  ) {
    errors.push('User cannot buy their own product.');
  }

  // Validate itemId
  if (!itemId) {
    errors.push('Item ID is required.');
  } else if (!mongoose.Types.ObjectId.isValid(itemId)) {
    errors.push('Item ID is not valid.');
  }

  // Validate quantity (if provided)
  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity <= 0) {
      errors.push('Quantity must be a positive number.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = validateCartData;