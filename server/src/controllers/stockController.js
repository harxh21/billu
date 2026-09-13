const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// @desc  Add purchased stock (increases stock)
// @route POST /api/stock/add
const addStock = async (req, res, next) => {
  try {
    const { productId, quantity, purchasePrice, supplier, notes } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      res.status(400);
      throw new Error('Product and a valid quantity are required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const previousStock = product.stockQty;
    product.stockQty += Number(quantity);
    if (purchasePrice) product.purchasePrice = purchasePrice;
    if (supplier) product.supplier = supplier;
    await product.save();

    await StockMovement.create({
      product: product._id,
      type: 'PURCHASE',
      quantity: Number(quantity),
      previousStock,
      newStock: product.stockQty,
      reason: notes || 'Stock purchase',
      createdBy: req.user._id,
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc  Manually adjust stock (increase or decrease with a reason)
// @route POST /api/stock/adjust
const adjustStock = async (req, res, next) => {
  try {
    const { productId, newQuantity, reason } = req.body;

    if (!productId || newQuantity == null || newQuantity < 0) {
      res.status(400);
      throw new Error('Product and a valid non-negative quantity are required');
    }
    if (!reason) {
      res.status(400);
      throw new Error('A reason is required for manual stock adjustments');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const previousStock = product.stockQty;
    product.stockQty = Number(newQuantity);
    await product.save();

    await StockMovement.create({
      product: product._id,
      type: 'ADJUSTMENT',
      quantity: product.stockQty - previousStock,
      previousStock,
      newStock: product.stockQty,
      reason,
      createdBy: req.user._id,
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc  Get stock movement history (optionally filtered by product)
// @route GET /api/stock/movements
const getMovements = async (req, res, next) => {
  try {
    const { productId, type, page = 1, limit = 30 } = req.query;
    const query = {};
    if (productId) query.product = productId;
    if (type) query.type = type;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const total = await StockMovement.countDocuments(query);
    const movements = await StockMovement.find(query)
      .populate('product', 'name sku')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: movements.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addStock, adjustStock, getMovements };
