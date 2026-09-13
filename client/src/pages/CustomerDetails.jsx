import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as customerService from '../services/customerService';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../utils/formatCurrency';
import { Receipt, IndianRupee } from 'lucide-react';

export default function CustomerDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    customerService.getCustomer(id).then((res) => setData(res.data.data));
  }, [id]);

  if (!data) return <LoadingSpinner size={32} />;

  const { customer, summary, recentBills } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{customer.name}</h1>
        <p className="text-slate-500 text-sm">{customer.phone} {customer.email && `• ${customer.email}`}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Purchases" value={formatCurrency(summary.totalPurchases)} icon={IndianRupee} color="green" />
        <StatCard title="Number of Bills" value={summary.numberOfBills} icon={Receipt} color="blue" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Purchases</h3>
        {recentBills.length === 0 ? (
          <p className="text-sm text-slate-400">No purchases yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentBills.map((bill) => (
              <Link key={bill._id} to={`/invoices/${bill._id}`} className="flex justify-between items-center py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{bill.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(bill.createdAt)}</p>
                </div>
                <span className="text-sm font-semibold text-slate-800">{formatCurrency(bill.totalAmount)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
