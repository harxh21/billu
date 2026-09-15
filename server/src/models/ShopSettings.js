const mongoose = require('mongoose');

const shopSettingsSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    shopName: { type: String, default: 'My Stationery Shop' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logo: { type: String, default: '' },
    defaultTaxRate: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    lowStockDefaultThreshold: { type: Number, default: 10 },
    invoiceFooterMessage: { type: String, default: 'Thank you for your business!' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShopSettings', shopSettingsSchema);
