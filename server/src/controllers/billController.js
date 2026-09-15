const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');

// @desc    Create a new bill (THE MOST IMPORTANT BUSINESS LOGIC)
// @route   POST /api/bills
//
// Flow:
// 1. Receive { items: [{ productId, quantity }], customerId, discount, paymentMethod }
// 2. For EVERY item, re-fetch the product from the DB (never trust frontend prices)
// 3. Validate stock availability
// 4. Calculate subtotal/tax/total on the BACKEND
// 5. Deduct stock + write a StockMovement record
// 6. Save the Bill with a snapshot of item data
// All of this happens inside a MongoDB transaction so it's all-or-nothing —
// if anything fails, NOTHING is saved (no partial bills, no partial stock deduction).
const createBill = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { items, customerId, discount = 0, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('Bill must contain at least one item');
    }
    if (!paymentMethod) {
      res.status(400);
      throw new Error('Payment method is required');
    }

    let subtotal = 0;
    let totalTax = 0;
    const billItems = [];

    for (const line of items) {
      const { productId, quantity } = line;

      if (!quantity || quantity <= 0) {
        res.status(400);
        throw new Error('Item quantity must be greater than zero');
      }

      // Fetch product fresh inside the transaction session
      const product = await Product.findOne({ _id: productId, shopId: req.user.shopId }).session(session);

      if (!product) {
        res.status(404);
        throw new Error(`Product not found (id: ${productId})`);
      }

      if (product.stockQty < quantity) {
        res.status(400);
        throw new Error(
          `Insufficient stock for "${product.name}". Only ${product.stockQty} unit(s) available.`
        );
      }

      // Price/tax always taken from the DB record, never from the frontend request
      const lineSubtotal = product.sellingPrice * quantity;
      const lineTax = (lineSubtotal * (product.taxRate || 0)) / 100;

      subtotal += lineSubtotal;
      totalTax += lineTax;

      billItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        price: product.sellingPrice,
        taxRate: product.taxRate || 0,
        subtotal: lineSubtotal,
      });

      // ---- STOCK DEDUCTION ----
      const previousStock = product.stockQty;
      product.stockQty -= quantity;
      await product.save({ session });

      // ---- AUDIT TRAIL ----
      await StockMovement.create(
        [
          {
            shopId: req.user.shopId,
            product: product._id,
            type: 'SALE',
            quantity: -quantity, // negative = stock going out
            previousStock,
            newStock: product.stockQty,
            createdBy: req.user._id,
          },
        ],
        { session }
      );
    }

    const discountAmount = Number(discount) || 0;
    const totalAmount = subtotal + totalTax - discountAmount;

    if (totalAmount < 0) {
      res.status(400);
      throw new Error('Discount cannot be greater than the bill subtotal + tax');
    }

    const invoiceNumber = await generateInvoiceNumber(req.user.shopId);

    const bill = await Bill.create(
      [
        {
          shopId: req.user.shopId,
          invoiceNumber,
          items: billItems,
          subtotal,
          discount: discountAmount,
          tax: totalTax,
          totalAmount,
          paymentMethod,
          customer: customerId || null,
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    // Link the stock movements we just created to this bill for traceability
    await StockMovement.updateMany(
      { shopId: req.user.shopId, createdBy: req.user._id, type: 'SALE', reference: null, createdAt: { $gte: new Date(Date.now() - 5000) } },
      { reference: bill[0]._id, referenceModel: 'Bill' },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: bill[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc  Get all bills (sales history) with filters
// @route GET /api/bills
const getBills = async (req, res, next) => {
  try {
    const { search, customer, paymentMethod, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { shopId: req.user.shopId };

    if (search) query.invoiceNumber = { $regex: search, $options: 'i' };
    if (customer) query.customer = customer;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Staff can see bills, but the frontend limits which columns/actions are shown for them.
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .populate('customer', 'name phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bills.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single bill (for invoice view/download)
// @route GET /api/bills/:id
const getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, shopId: req.user.shopId })
      .populate('customer', 'name phone email address')
      .populate('createdBy', 'name');

    if (!bill) {
      res.status(404);
      throw new Error('Bill not found');
    }

    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBill, getBills, getBill };
