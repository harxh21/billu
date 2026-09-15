const Bill = require('../models/Bill');

// Generates sequential invoice numbers like INV-2026-00001
async function generateInvoiceNumber(shopId) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  // Find the latest bill for THIS shop and year, sorted by invoice number descending
  const lastBill = await Bill.findOne({
    shopId,
    invoiceNumber: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;
  if (lastBill) {
    const lastSeq = parseInt(lastBill.invoiceNumber.split('-')[2], 10);
    nextNumber = lastSeq + 1;
  }

  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
}

module.exports = generateInvoiceNumber;
