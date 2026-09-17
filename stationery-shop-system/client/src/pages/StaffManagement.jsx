import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import * as userService from '../services/userService';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Alert from '../components/common/Alert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';

export default function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  const loadUsers = async () => {
    const res = await userService.getUsers();
    setUsers(res.data.data);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await userService.createUser(form);
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'staff' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleActive = async (u) => {
    await userService.updateUser(u._id, { isActive: !u.isActive });
    loadUsers();
  };

  const handleDelete = async () => {
    await userService.deleteUser(deleteTarget._id);
    loadUsers();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
        <Button onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-2"><Plus size={16} /> Add Staff</span>
        </Button>
      </div>

      <Table columns={['Name', 'Email', 'Role', 'Status', 'Actions']}>
        {users.map((u) => (
          <tr key={u._id}>
            <td className="px-4 py-3 text-sm font-medium text-slate-800">{u.name}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
            <td className="px-4 py-3 text-sm text-slate-500 capitalize">{u.role}</td>
            <td className="px-4 py-3">
              <button
                onClick={() => toggleActive(u)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
              >
                {u.isActive ? 'Active' : 'Disabled'}
              </button>
            </td>
            <td className="px-4 py-3">
              {u._id !== currentUser._id && (
                <button onClick={() => setDeleteTarget(u)} className="text-slate-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <Alert type="error" message={error} />}
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[{ value: 'staff', label: 'Staff' }, { value: 'owner', label: 'Owner' }]}
          />
          <Button type="submit" className="w-full">Create User</Button>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Staff"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
