const Customer = require('../models/Customer');
const Bill = require('../models/Bill');

// @desc  Get all customers (with search)
// @route GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { shopId: req.user.shopId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single customer with purchase history/summary
// @route GET /api/customers/:id
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, shopId: req.user.shopId });
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    const bills = await Bill.find({ customer: customer._id, shopId: req.user.shopId }).sort({ createdAt: -1 });

    const totalPurchases = bills.reduce((sum, b) => sum + b.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        customer,
        summary: {
          totalPurchases,
          numberOfBills: bills.length,
        },
        recentBills: bills.slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create customer
// @route POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      res.status(400);
      throw new Error('Name and phone are required');
    }
    const customer = await Customer.create({ ...req.body, shopId: req.user.shopId });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc  Update customer
// @route PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, shopId: req.user.shopId });
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    Object.assign(customer, req.body);
    await customer.save();
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete customer
// @route DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, shopId: req.user.shopId });
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    await customer.deleteOne();
    res.status(200).json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
