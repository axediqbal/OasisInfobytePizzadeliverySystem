const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');

// Public catalog route
router.get('/', catalogController.getCatalog);

module.exports = router;
