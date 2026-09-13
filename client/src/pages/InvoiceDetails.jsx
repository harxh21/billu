import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as billService from '../services/billService';
import * as settingsService from '../services/settingsService';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../utils/formatCurrency';

export default function InvoiceDetails() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    Promise.all([billService.getBill(id), settingsService.getSettings()]).then(([billRes, settingsRes]) => {
      setBill(billRes.data.data);
      setShop(settingsRes.data.data);
    });
  }, [id]);

  if (!bill || !shop) return <LoadingSpinner size={32} />;

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(shop.shopName, 14, 18);
    doc.setFontSize(10);
    doc.text(shop.address || '', 14, 25);
    doc.text(`Phone: ${shop.phone || '-'}`, 14, 30);

    doc.setFontSize(12);
    doc.text(`Invoice: ${bill.invoiceNumber}`, 140, 18);
    doc.setFontSize(10);
    doc.text(`Date: ${formatDateTime(bill.createdAt)}`, 140, 24);
    doc.text(`Cashier: ${bill.createdBy?.name || '-'}`, 140, 29);

    doc.text(`Customer: ${bill.customer?.name || 'Walk-in Customer'}`, 14, 40);
    doc.text(`Phone: ${bill.customer?.phone || '-'}`, 14, 45);

    autoTable(doc, {
      startY: 52,
      head: [['Product', 'Qty', 'Price', 'Subtotal']],
      body: bill.items.map((item) => [item.name, item.quantity, formatCurrency(item.price), formatCurrency(item.subtotal)]),
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${formatCurrency(bill.subtotal)}`, 140, finalY);
    doc.text(`Discount: ${formatCurrency(bill.discount)}`, 140, finalY + 6);
    doc.text(`Tax/GST: ${formatCurrency(bill.tax)}`, 140, finalY + 12);
    doc.setFontSize(12);
    doc.text(`Grand Total: ${formatCurrency(bill.totalAmount)}`, 140, finalY + 20);
    doc.setFontSize(10);
    doc.text(`Payment Method: ${bill.paymentMethod}`, 14, finalY + 20);

    doc.setFontSize(9);
    doc.text(shop.invoiceFooterMessage || 'Thank you for your business!', 14, finalY + 35);

    doc.save(`${bill.invoiceNumber}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Invoice</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => window.print()}>
            <span className="flex items-center gap-2"><Printer size={16} /> Print</span>
          </Button>
          <Button onClick={generatePDF}>
            <span className="flex items-center gap-2"><Download size={16} /> Download PDF</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8" id="invoice-print-area">
        <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{shop.shopName}</h2>
            <p className="text-sm text-slate-500">{shop.address}</p>
            <p className="text-sm text-slate-500">{shop.phone}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-800">{bill.invoiceNumber}</p>
            <p className="text-sm text-slate-500">{formatDateTime(bill.createdAt)}</p>
            <p className="text-sm text-slate-500">Cashier: {bill.createdBy?.name}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-500">Billed To</p>
          <p className="font-medium text-slate-800">{bill.customer?.name || 'Walk-in Customer'}</p>
          <p className="text-sm text-slate-500">{bill.customer?.phone}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Product</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Price</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{formatCurrency(item.price)}</td>
                <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(bill.subtotal)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Discount</span><span>-{formatCurrency(bill.discount)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Tax/GST</span><span>{formatCurrency(bill.tax)}</span></div>
            <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200">
              <span>Grand Total</span><span>{formatCurrency(bill.totalAmount)}</span>
            </div>
            <p className="text-slate-500 pt-1">Payment: {bill.paymentMethod}</p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">{shop.invoiceFooterMessage}</p>
      </div>
    </div>
  );
}
