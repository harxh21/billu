const express = require('express');
const {
  getDashboardStats,
  getSalesChart,
  getBestSelling,
  getStockReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/sales-chart', protect, getSalesChart);
router.get('/best-selling', protect, authorize('owner'), getBestSelling);
router.get('/stock', protect, authorize('owner'), getStockReport);

module.exports = router;
