const express = require('express');
const { createBill, getBills, getBill } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Both owner and staff can create bills and view sales history
router.post('/', protect, createBill);
router.get('/', protect, getBills);
router.get('/:id', protect, getBill);

module.exports = router;
