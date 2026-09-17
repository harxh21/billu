import { useEffect, useState } from 'react';
import * as productService from '../services/productService';
import * as stockService from '../services/stockService';
import Table from '../components/common/Table';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import { formatDateTime } from '../utils/formatCurrency';

const typeStyles = {
  PURCHASE: 'bg-green-100 text-green-700',
  SALE: 'bg-indigo-100 text-indigo-700',
  RETURN: 'bg-purple-100 text-purple-700',
  ADJUSTMENT: 'bg-orange-100 text-orange-700',
};

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [addForm, setAddForm] = useState({ productId: '', quantity: '', purchasePrice: '', supplier: '', notes: '' });
  const [adjustForm, setAdjustForm] = useState({ productId: '', newQuantity: '', reason: '' });

  const loadData = async () => {
    const [prodRes, movRes] = await Promise.all([
      productService.getProducts({ limit: 200 }),
      stockService.getMovements({ limit: 30 }),
    ]);
    setProducts(prodRes.data.data);
    setMovements(movRes.data.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await stockService.addStock({
        ...addForm,
        quantity: Number(addForm.quantity),
        purchasePrice: addForm.purchasePrice ? Number(addForm.purchasePrice) : undefined,
      });
      setAddModalOpen(false);
      setAddForm({ productId: '', quantity: '', purchasePrice: '', supplier: '', notes: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add stock');
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await stockService.adjustStock({ ...adjustForm, newQuantity: Number(adjustForm.newQuantity) });
      setAdjustModalOpen(false);
      setAdjustForm({ productId: '', newQuantity: '', reason: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const productOptions = [{ value: '', label: 'Select product...' }, ...products.map((p) => ({ value: p._id, label: `${p.name} (Current: ${p.stockQty})` }))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Stock Management</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setAdjustModalOpen(true)}>Manual Adjustment</Button>
          <Button onClick={() => setAddModalOpen(true)}>Add Purchased Stock</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Stock Movements</h3>
        <Table columns={['Product', 'Type', 'Quantity', 'Previous', 'New', 'Reason', 'By', 'Date']}>
          {movements.map((m) => (
            <tr key={m._id}>
              <td className="px-4 py-3 text-sm text-slate-800">{m.product?.name}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles[m.type]}`}>{m.type}</span>
              </td>
              <td className="px-4 py-3 text-sm">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.previousStock}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.newStock}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.reason || '-'}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{m.createdBy?.name}</td>
              <td className="px-4 py-3 text-sm text-slate-400">{formatDateTime(m.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Purchased Stock">
        <form onSubmit={handleAddStock} className="space-y-4">
          {error && <Alert type="error" message={error} />}
          <Select label="Product" value={addForm.productId} onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })} options={productOptions} required />
          <Input label="Quantity Added" type="number" min="1" value={addForm.quantity} onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })} required />
          <Input label="Purchase Price (optional, updates product)" type="number" value={addForm.purchasePrice} onChange={(e) => setAddForm({ ...addForm, purchasePrice: e.target.value })} />
          <Input label="Supplier" value={addForm.supplier} onChange={(e) => setAddForm({ ...addForm, supplier: e.target.value })} />
          <Input label="Notes" value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} />
          <Button type="submit" className="w-full">Add Stock</Button>
        </form>
      </Modal>

      <Modal isOpen={adjustModalOpen} onClose={() => setAdjustModalOpen(false)} title="Manual Stock Adjustment">
        <form onSubmit={handleAdjustStock} className="space-y-4">
          {error && <Alert type="error" message={error} />}
          <Select label="Product" value={adjustForm.productId} onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })} options={productOptions} required />
          <Input label="New Stock Quantity" type="number" min="0" value={adjustForm.newQuantity} onChange={(e) => setAdjustForm({ ...adjustForm, newQuantity: e.target.value })} required />
          <Input label="Reason (required)" value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} placeholder="e.g. Damaged goods, stock count correction..." required />
          <Button type="submit" className="w-full">Save Adjustment</Button>
        </form>
      </Modal>
    </div>
  );
}
