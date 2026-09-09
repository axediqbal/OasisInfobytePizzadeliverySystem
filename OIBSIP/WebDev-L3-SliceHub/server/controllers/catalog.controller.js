const InventoryItem = require('../models/InventoryItem');

// GET /api/catalog
exports.getCatalog = async (req, res, next) => {
  try {
    const items = await InventoryItem.find().sort({ price: 1, name: 1 });

    const catalog = {
      bases: items.filter(i => i.category === 'base').map(formatItem),
      sauces: items.filter(i => i.category === 'sauce').map(formatItem),
      cheeses: items.filter(i => i.category === 'cheese').map(formatItem),
      vegetables: items.filter(i => i.category === 'vegetable').map(formatItem),
    };

    res.status(200).json({
      success: true,
      data: catalog,
    });
  } catch (error) {
    next(error);
  }
};

const formatItem = (item) => ({
  _id: item._id,
  name: item.name,
  category: item.category,
  price: item.price,
  inStock: item.quantity > 0,
  quantity: item.quantity,
});
