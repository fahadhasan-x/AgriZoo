const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Get all categories or children of a specific category
router.get('/', categoryController.getAllCategories);

// Get products by category
router.get('/:slug/products', categoryController.getProductsByCategory);

module.exports = router; 
