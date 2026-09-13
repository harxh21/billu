const Product = require('../models/Product');

// @desc  Get all products (with search, filter, sort, pagination)
// @route GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, stockFilter, sortBy, sortOrder, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;

    let products = await Product.find(query);

    // Stock filter applied after fetch since stockStatus is a virtual, not a stored field
    if (stockFilter) {
      products = products.filter((p) => p.stockStatus === stockFilter);
    }

    // Sorting
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      products.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1 * order;
        if (a[sortBy] > b[sortBy]) return 1 * order;
        return 0;
      });
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = products.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = products.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single product
// @route GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc  Create product
// @route POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, purchasePrice, sellingPrice } = req.body;

    if (!name || !sku || !category || purchasePrice == null || sellingPrice == null) {
      res.status(400);
      throw new Error('Name, SKU, category, purchase price and selling price are required');
    }

    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      res.status(400);
      throw new Error('A product with this SKU already exists');
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc  Update product
// @route PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Prevent direct stock edits through this route — stock must go through
    // the dedicated stock routes so a StockMovement record is always created.
    delete req.body.stockQty;

    Object.assign(product, req.body);
    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete product
// @route DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    await product.deleteOne();
    // Note: old Bills keep a snapshot of product name/price, so deleting
    // a product never breaks historical invoices (Rule 7).
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get distinct categories
// @route GET /api/products/categories/list
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
