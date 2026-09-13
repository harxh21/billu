const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Both owner and staff can view products (needed for billing screen)
router.get('/', protect, getProducts);
router.get('/categories/list', protect, getCategories);
router.get('/:id', protect, getProduct);

// Only owner can create/edit/delete products
router.post('/', protect, authorize('owner'), createProduct);
router.put('/:id', protect, authorize('owner'), updateProduct);
router.delete('/:id', protect, authorize('owner'), deleteProduct);

module.exports = router;
