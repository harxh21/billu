const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    stockQty: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, required: true, default: 10, min: 0 },
    unit: { type: String, default: 'pcs' },
    supplier: { type: String, trim: true, default: '' },
    imageUrl: { type: String, default: '' },
    isSeedData: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.virtual('stockStatus').get(function () {
  if (this.stockQty === 0) return 'OUT_OF_STOCK';
  if (this.stockQty <= this.lowStockThreshold) return 'LOW_STOCK';
  return 'IN_STOCK';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
