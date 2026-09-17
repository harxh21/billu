const Bill = require('../models/Bill');
const Product = require('../models/Product');

// Helper: aggregate total sales & bill count between two dates
const salesBetween = async (shopId, start, end) => {
  const result = await Bill.aggregate([
    { $match: { shopId, createdAt: { $gte: start, $lte: end }, status: 'COMPLETED' } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalBills: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { totalSales: 0, totalBills: 0 };
};

// @desc  Dashboard summary stats
// @route GET /api/reports/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const shopId = req.user.shopId;
    const todayStats = await salesBetween(shopId, startOfToday, endOfToday);
    const monthStats = await salesBetween(shopId, startOfMonth, endOfToday);

    const totalProducts = await Product.countDocuments({ shopId });
    const products = await Product.find({ shopId });
    const totalStockQty = products.reduce((sum, p) => sum + p.stockQty, 0);
    const totalStockValue = products.reduce((sum, p) => sum + p.stockQty * p.purchasePrice, 0);
    const lowStockProducts = products.filter((p) => p.stockStatus === 'LOW_STOCK' || p.stockStatus === 'OUT_OF_STOCK');

    const recentBills = await Bill.find({ shopId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        todaySales: todayStats.totalSales,
        todayBillsCount: todayStats.totalBills,
        monthSales: monthStats.totalSales,
        totalProducts,
        totalStockQty,
        totalStockValue,
        lowStockProducts: lowStockProducts.map((p) => ({
          _id: p._id,
          name: p.name,
          stockQty: p.stockQty,
          lowStockThreshold: p.lowStockThreshold,
          stockStatus: p.stockStatus,
        })),
        recentBills,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Sales grouped by day for a date range (used for charts)
// @route GET /api/reports/sales-chart?range=7 (days)
const getSalesChart = async (req, res, next) => {
  try {
    const days = parseInt(req.query.range, 10) || 7;
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const results = await Bill.aggregate([
      { $match: { shopId: req.user.shopId, createdAt: { $gte: start }, status: 'COMPLETED' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          totalBills: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc  Best-selling products
// @route GET /api/reports/best-selling
const getBestSelling = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const results = await Bill.aggregate([
      { $match: { shopId: req.user.shopId, status: 'COMPLETED' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc  Stock report — current stock value & status of every product
// @route GET /api/reports/stock
const getStockReport = async (req, res, next) => {
  try {
    const products = await Product.find({ shopId: req.user.shopId }).sort({ stockQty: 1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getSalesChart, getBestSelling, getStockReport };
