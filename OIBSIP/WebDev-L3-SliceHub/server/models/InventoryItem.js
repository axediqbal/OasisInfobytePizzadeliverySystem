const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'vegetable'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  threshold: {
    type: Number,
    required: true,
    default: 20
  },
  lastAlertedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

inventoryItemSchema.index({ category: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
