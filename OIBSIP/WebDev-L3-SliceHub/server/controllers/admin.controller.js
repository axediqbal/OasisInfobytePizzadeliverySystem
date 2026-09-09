const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
const Order = require('../models/Order');

const generateAdminToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
  return jwt.sign(
    {
      id: user._id,
      role: 'admin',
      name: user.name,
      email: user.email,
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

// POST /api/admin/login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide admin email and password.',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: 'admin',
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.',
      });
    }

    const token = generateAdminToken(user);

    res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/inventory
exports.getInventory = async (req, res, next) => {
  try {
    const items = await InventoryItem.find().sort({ category: 1, name: 1 });
    
    // Low items summary
    const lowStockCount = items.filter(item => item.quantity < item.threshold).length;

    res.status(200).json({
      success: true,
      count: items.length,
      lowStockCount,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/inventory/:id
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, threshold, price, name } = req.body;

    const updates = {};
    if (quantity !== undefined) {
      if (Number(quantity) < 0) {
        return res.status(400).json({ success: false, message: 'Quantity cannot be negative.' });
      }
      updates.quantity = Number(quantity);
    }
    if (threshold !== undefined) {
      if (Number(threshold) < 0) {
        return res.status(400).json({ success: false, message: 'Threshold cannot be negative.' });
      }
      updates.threshold = Number(threshold);
    }
    if (price !== undefined) {
      if (Number(price) < 0) {
        return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      }
      updates.price = Number(price);
    }
    if (name) {
      updates.name = name.trim();
    }

    const item = await InventoryItem.findByIdAndUpdate(id, updates, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['Order Received', 'In Kitchen', 'Sent to Delivery'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to "${orderStatus}".`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
