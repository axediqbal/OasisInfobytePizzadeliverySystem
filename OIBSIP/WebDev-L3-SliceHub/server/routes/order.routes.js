const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth');

// All order routes require authenticated user
router.use(auth);

router.post('/', orderController.createOrder);
router.get('/mine', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/create-razorpay-order', orderController.createRazorpayOrder);
router.post('/:id/verify-payment', orderController.verifyPayment);

module.exports = router;
