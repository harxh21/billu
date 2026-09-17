import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye } from 'lucide-react';
import * as customerService from '../services/customerService';
import Table from '../components/common/Table';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadCustomers = useCallback(async () => {
    const res = await customerService.getCustomers({ search: search || undefined });
    setCustomers(res.data.data);
  }, [search]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await customerService.createCustomer(form);
      setModalOpen(false);
      setForm({ name: '', phone: '', email: '', address: '' });
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const handleDelete = async () => {
    await customerService.deleteCustomer(deleteTarget._id);
    loadCustomers();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
        <Button onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-2"><Plus size={16} /> Add Customer</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or phone..." />
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No customers found.</div>
      ) : (
        <Table columns={['Name', 'Phone', 'Email', 'Address', 'Actions']}>
          {customers.map((c) => (
            <tr key={c._id}>
              <td className="px-4 py-3 text-sm font-medium text-slate-800">{c.name}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{c.phone}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{c.email || '-'}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{c.address || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/customers/${c._id}`)} className="text-slate-400 hover:text-indigo-600">
                    <Eye size={16} />
                  </button>
                  {user?.role === 'owner' && (
                    <button onClick={() => setDeleteTarget(c)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <Alert type="error" message={error} />}
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Button type="submit" className="w-full">Save Customer</Button>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
