const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Public admin login
router.post('/login', adminController.adminLogin);

// Protected admin routes
router.use(auth, adminOnly);

// Inventory routes
router.get('/inventory', adminController.getInventory);
router.patch('/inventory/:id', adminController.updateInventoryItem);

// Order management routes
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
