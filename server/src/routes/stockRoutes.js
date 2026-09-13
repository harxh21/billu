const express = require('express');
const { addStock, adjustStock, getMovements } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Only owner can add purchased stock or make manual adjustments
router.post('/add', protect, authorize('owner'), addStock);
router.post('/adjust', protect, authorize('owner'), adjustStock);
router.get('/movements', protect, authorize('owner'), getMovements);

module.exports = router;
