import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import * as billService from '../services/billService';
import Table from '../components/common/Table';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../utils/formatCurrency';

export default function SalesHistory() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billService.getBills({
        search: search || undefined,
        paymentMethod: paymentMethod || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      });
      setBills(res.data.data);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, paymentMethod, startDate, endDate, page]);

  useEffect(() => { loadBills(); }, [loadBills]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Sales History</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoice number..." />
        <Select
          value={paymentMethod}
          onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All Payment Methods' },
            { value: 'CASH', label: 'Cash' },
            { value: 'UPI', label: 'UPI' },
            { value: 'CARD', label: 'Card' },
            { value: 'OTHER', label: 'Other' },
          ]}
        />
        <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
        <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
      </div>

      {loading ? (
        <LoadingSpinner size={32} />
      ) : bills.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No bills found.</div>
      ) : (
        <>
          <Table columns={['Invoice #', 'Date', 'Customer', 'Cashier', 'Payment', 'Total', 'Actions']}>
            {bills.map((bill) => (
              <tr key={bill._id}>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{bill.invoiceNumber}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(bill.createdAt)}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{bill.customer?.name || 'Walk-in'}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{bill.createdBy?.name}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{bill.paymentMethod}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">{formatCurrency(bill.totalAmount)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/invoices/${bill._id}`)} className="text-slate-400 hover:text-blue-600">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
