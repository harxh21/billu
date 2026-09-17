import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as productService from '../services/productService';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

const CATEGORY_OPTIONS = [
  'Pens', 'Pencils', 'Notebooks', 'Registers', 'Files & Folders', 'Art Supplies',
  'School Supplies', 'Office Supplies', 'Paper', 'Markers', 'Erasers',
  'Sharpeners', 'Geometry Items', 'Craft Materials', 'Other',
];

const emptyForm = {
  name: '', sku: '', category: 'Pens', brand: '', description: '',
  purchasePrice: '', sellingPrice: '', taxRate: 0, stockQty: 0,
  lowStockThreshold: 10, unit: 'pcs', supplier: '',
};

export default function AddEditProduct() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      productService.getProduct(id).then((res) => {
        const p = res.data.data;
        setForm({
          name: p.name, sku: p.sku, category: p.category, brand: p.brand || '',
          description: p.description || '', purchasePrice: p.purchasePrice,
          sellingPrice: p.sellingPrice, taxRate: p.taxRate, stockQty: p.stockQty,
          lowStockThreshold: p.lowStockThreshold, unit: p.unit, supplier: p.supplier || '',
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.sku || !form.category || !form.purchasePrice || !form.sellingPrice) {
      setError('Please fill in all required fields.');
      return;
    }
    if (Number(form.purchasePrice) < 0 || Number(form.sellingPrice) < 0) {
      setError('Prices cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        taxRate: Number(form.taxRate),
        stockQty: Number(form.stockQty),
        lowStockThreshold: Number(form.lowStockThreshold),
      };

      if (isEdit) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        {error && <Alert type="error" message={error} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Product Name *" value={form.name} onChange={handleChange('name')} />
          <Input label="SKU / Product Code *" value={form.sku} onChange={handleChange('sku')} disabled={isEdit} />
          <Select
            label="Category *"
            value={form.category}
            onChange={handleChange('category')}
            options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
          <Input label="Brand" value={form.brand} onChange={handleChange('brand')} />
        </div>

        <Input label="Description" value={form.description} onChange={handleChange('description')} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Purchase Price (₹) *" type="number" step="0.01" value={form.purchasePrice} onChange={handleChange('purchasePrice')} />
          <Input label="Selling Price (₹) *" type="number" step="0.01" value={form.sellingPrice} onChange={handleChange('sellingPrice')} />
          <Input label="GST / Tax Rate (%)" type="number" step="0.01" value={form.taxRate} onChange={handleChange('taxRate')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={isEdit ? 'Current Stock (use Stock Management to change)' : 'Opening Stock'}
            type="number"
            value={form.stockQty}
            onChange={handleChange('stockQty')}
            disabled={isEdit}
          />
          <Input label="Minimum Stock Threshold" type="number" value={form.lowStockThreshold} onChange={handleChange('lowStockThreshold')} />
          <Input label="Unit" value={form.unit} onChange={handleChange('unit')} placeholder="pcs, box, pack..." />
        </div>

        <Input label="Supplier (optional)" value={form.supplier} onChange={handleChange('supplier')} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/products')}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</Button>
        </div>
      </form>
    </div>
  );
}
