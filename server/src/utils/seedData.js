// Run with: npm run seed
// Creates a default owner account + demo stationery products for testing.
// Demo products are flagged isSeedData: true so they're clearly separate from real shop data.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const ShopSettings = require('../models/ShopSettings');

const seed = async () => {
  await connectDB();

  // --- Default Owner Account ---
  let owner = await User.findOne({ email: 'owner@shop.com' });
  if (!owner) {
    const hashedPassword = await bcrypt.hash('owner123', 10);
    owner = new User({
      name: 'Shop Owner',
      email: 'owner@shop.com',
      password: hashedPassword,
      role: 'owner',
    });
    owner.shopId = owner._id;
    await owner.save();
    console.log('Created default owner: owner@shop.com / owner123');
  }
  const shopId = owner.shopId;

  // --- Default Staff Account ---
  const staffExists = await User.findOne({ email: 'staff@shop.com' });
  if (!staffExists) {
    const hashedPassword = await bcrypt.hash('staff123', 10);
    await User.create({
      name: 'Shop Staff',
      email: 'staff@shop.com',
      password: hashedPassword,
      role: 'staff',
      shopId,
    });
    console.log('Created default staff: staff@shop.com / staff123');
  }

  // --- Shop Settings ---
  const settingsExist = await ShopSettings.findOne({ shopId });
  if (!settingsExist) {
    await ShopSettings.create({
      shopId,
      shopName: 'Demo Shop',
      address: '123 Market Road, Your City',
      phone: '9999999999',
      email: 'shop@example.com',
    });
    console.log('Created default shop settings');
  }

  // --- Demo Products ---
  const demoProducts = [
    { name: 'Blue Ball Pen', sku: 'PEN-BLU-01', category: 'Pens', purchasePrice: 3, sellingPrice: 5, stockQty: 200, lowStockThreshold: 30, unit: 'pcs' },
    { name: 'Black Ball Pen', sku: 'PEN-BLK-01', category: 'Pens', purchasePrice: 3, sellingPrice: 5, stockQty: 150, lowStockThreshold: 30, unit: 'pcs' },
    { name: 'HB Pencil', sku: 'PEN-HB-01', category: 'Pencils', purchasePrice: 2, sellingPrice: 4, stockQty: 300, lowStockThreshold: 50, unit: 'pcs' },
    { name: 'Eraser', sku: 'ERA-01', category: 'Erasers', purchasePrice: 1, sellingPrice: 2, stockQty: 4, lowStockThreshold: 10, unit: 'pcs' },
    { name: 'Sharpener', sku: 'SHA-01', category: 'Sharpeners', purchasePrice: 2, sellingPrice: 4, stockQty: 7, lowStockThreshold: 15, unit: 'pcs' },
    { name: 'A4 Notebook (200 pages)', sku: 'NB-A4-200', category: 'Notebooks', purchasePrice: 30, sellingPrice: 45, stockQty: 3, lowStockThreshold: 5, unit: 'pcs' },
    { name: 'Long Notebook', sku: 'NB-LNG-01', category: 'Notebooks', purchasePrice: 25, sellingPrice: 38, stockQty: 60, lowStockThreshold: 10, unit: 'pcs' },
    { name: 'Register (300 pages)', sku: 'REG-300', category: 'Registers', purchasePrice: 60, sellingPrice: 85, stockQty: 25, lowStockThreshold: 5, unit: 'pcs' },
    { name: 'File Folder', sku: 'FIL-01', category: 'Files & Folders', purchasePrice: 8, sellingPrice: 15, stockQty: 100, lowStockThreshold: 20, unit: 'pcs' },
    { name: 'A4 Paper Pack (500 sheets)', sku: 'PPR-A4-500', category: 'Paper', purchasePrice: 220, sellingPrice: 280, stockQty: 40, lowStockThreshold: 8, unit: 'pack', taxRate: 12 },
    { name: 'Permanent Marker', sku: 'MRK-PERM-01', category: 'Markers', purchasePrice: 12, sellingPrice: 20, stockQty: 80, lowStockThreshold: 15, unit: 'pcs' },
    { name: 'Sketch Pens (Set of 12)', sku: 'MRK-SKT-12', category: 'Art Supplies', purchasePrice: 45, sellingPrice: 70, stockQty: 35, lowStockThreshold: 10, unit: 'set' },
    { name: 'Geometry Box', sku: 'GEO-01', category: 'Geometry Items', purchasePrice: 40, sellingPrice: 65, stockQty: 20, lowStockThreshold: 5, unit: 'pcs' },
    { name: 'Glue Stick', sku: 'GLU-STK-01', category: 'Craft Materials', purchasePrice: 10, sellingPrice: 18, stockQty: 55, lowStockThreshold: 10, unit: 'pcs' },
    { name: 'Fevicol (100ml)', sku: 'GLU-FEV-100', category: 'Craft Materials', purchasePrice: 25, sellingPrice: 38, stockQty: 45, lowStockThreshold: 10, unit: 'pcs' },
    { name: 'Scale (30cm)', sku: 'SCL-30', category: 'Geometry Items', purchasePrice: 8, sellingPrice: 15, stockQty: 70, lowStockThreshold: 15, unit: 'pcs' },
    { name: 'Colour Pencils (Set of 24)', sku: 'PEN-CLR-24', category: 'Art Supplies', purchasePrice: 60, sellingPrice: 95, stockQty: 30, lowStockThreshold: 8, unit: 'set' },
  ];

  for (const p of demoProducts) {
    const exists = await Product.findOne({ sku: p.sku, shopId });
    if (!exists) {
      await Product.create({ ...p, shopId, isSeedData: true });
    }
  }
  console.log(`Seeded ${demoProducts.length} demo products (flagged isSeedData: true)`);

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
