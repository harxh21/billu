import { useEffect, useState } from 'react';
import * as settingsService from '../services/settingsService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

export default function Settings() {
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    settingsService.getSettings().then((res) => setForm(res.data.data));
  }, []);

  if (!form) return null;

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await settingsService.updateSettings(form);
      setMessage('Settings updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        {message && <Alert type="success" message={message} />}
        {error && <Alert type="error" message={error} />}

        <h3 className="font-semibold text-slate-800">Shop Information</h3>
        <Input label="Shop Name" value={form.shopName} onChange={handleChange('shopName')} />
        <Input label="Address" value={form.address} onChange={handleChange('address')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" value={form.phone} onChange={handleChange('phone')} />
          <Input label="Email" value={form.email} onChange={handleChange('email')} />
        </div>

        <h3 className="font-semibold text-slate-800 pt-2">System Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Currency" value={form.currency} onChange={handleChange('currency')} />
          <Input label="Default Tax Rate (%)" type="number" value={form.defaultTaxRate} onChange={handleChange('defaultTaxRate')} />
        </div>
        <Input label="Default Low Stock Threshold" type="number" value={form.lowStockDefaultThreshold} onChange={handleChange('lowStockDefaultThreshold')} />
        <Input label="Invoice Footer Message" value={form.invoiceFooterMessage} onChange={handleChange('invoiceFooterMessage')} />

        <Button type="submit" className="w-full">Save Settings</Button>
      </form>
    </div>
  );
}
