import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Search } from 'lucide-react';
import * as productService from '../services/productService';
import * as billService from '../services/billService';
import * as customerService from '../services/customerService';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { formatCurrency } from '../utils/formatCurrency';

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]); // { product, quantity }
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    productService.getCategories().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      productService.getProducts({ search, category, limit: 30 }).then((res) => setProducts(res.data.data));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, category]);

  const addToCart = (product) => {
    setError('');
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing) {
      if (existing.quantity + 1 > product.stockQty) {
        setError(`Only ${product.stockQty} unit(s) of "${product.name}" available.`);
        return;
      }
      setCart(cart.map((item) => (item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      if (product.stockQty < 1) {
        setError(`"${product.name}" is out of stock.`);
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const changeQuantity = (productId, delta) => {
    setError('');
    setCart(
      cart
        .map((item) => {
          if (item.product._id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty > item.product.stockQty) {
            setError(`Only ${item.product.stockQty} unit(s) of "${item.product.name}" available.`);
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => setCart(cart.filter((item) => item.product._id !== productId));

  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const tax = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity * (item.product.taxRate || 0)) / 100, 0);
  const grandTotal = subtotal + tax - Number(discount || 0);

  const handleGenerateBill = async () => {
    setError('');
    if (cart.length === 0) {
      setError('Cart is empty. Add at least one product.');
      return;
    }
    if (grandTotal < 0) {
      setError('Discount cannot exceed the bill total.');
      return;
    }

    setSubmitting(true);
    try {
      let customerId = null;

      // Customer is optional — only create/find one if a phone number was entered
      if (customerPhone) {
        const existingRes = await customerService.getCustomers({ search: customerPhone });
        const match = existingRes.data.data.find((c) => c.phone === customerPhone);
        if (match) {
          customerId = match._id;
        } else {
          const newCustomer = await customerService.createCustomer({
            name: customerName || 'Walk-in Customer',
            phone: customerPhone,
          });
          customerId = newCustomer.data.data._id;
        }
      }

      const res = await billService.createBill({
        items: cart.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
        customerId,
        discount: Number(discount) || 0,
        paymentMethod,
      });

      navigate(`/invoices/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* LEFT: Product Search */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c, label: c }))]}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((p) => (
            <button
              key={p._id}
              onClick={() => addToCart(p)}
              disabled={p.stockQty === 0}
              className="text-left bg-white border border-slate-200 rounded-xl p-3 hover:border-indigo-400 hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <p className="text-sm font-medium text-slate-800 line-clamp-2">{p.name}</p>
              <p className="text-xs text-slate-400 mt-1">{p.sku}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-semibold text-indigo-600">{formatCurrency(p.sellingPrice)}</span>
                <span className={`text-xs ${p.stockQty === 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  {p.stockQty} {p.unit}
                </span>
              </div>
            </button>
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-slate-400 py-10">No products found.</p>
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-fit lg:sticky lg:top-6">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Current Bill</h3>
        </div>

        <div className="flex-1 overflow-y-auto max-h-80 p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Cart is empty. Click a product to add it.</p>
          ) : (
            cart.map((item) => (
              <div key={item.product._id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(item.product.sellingPrice)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => changeQuantity(item.product._id, -1)} className="p-1 rounded bg-slate-100 hover:bg-slate-200">
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.product._id, 1)} className="p-1 rounded bg-slate-100 hover:bg-slate-200">
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-sm font-medium w-16 text-right">{formatCurrency(item.product.sellingPrice * item.quantity)}</span>
                <button onClick={() => removeFromCart(item.product._id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 space-y-3">
          {error && <Alert type="error" message={error} />}

          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Customer phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Tax/GST</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Discount (₹)</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-20 text-right border border-slate-200 rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t border-slate-100">
              <span>Grand Total</span><span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'CASH', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'CARD', label: 'Card' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />

          <Button className="w-full" onClick={handleGenerateBill} disabled={submitting}>
            {submitting ? 'Generating...' : 'Generate Bill'}
          </Button>
        </div>
      </div>
    </div>
  );
}
