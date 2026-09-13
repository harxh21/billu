import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  IndianRupee,
  Receipt,
  Package,
  Boxes,
  AlertTriangle,
  PlusCircle,
  ShoppingCart,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import * as reportService from '../services/reportService';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../utils/formatCurrency';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          reportService.getDashboardStats(),
          reportService.getSalesChart(14),
        ]);
        setStats(statsRes.data.data);
        setChartData(chartRes.data.data.map((d) => ({ date: d._id, sales: d.totalSales })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner size={32} />;
  if (!stats) return <p className="text-slate-500">Unable to load dashboard data.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-500 text-sm">Here's what's happening in your shop today.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {user?.role === 'owner' && (
          <Link to="/products/new" className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <PlusCircle size={16} className="text-blue-600" /> Add Product
          </Link>
        )}
        <Link to="/billing" className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <ShoppingCart size={16} className="text-green-600" /> Create Bill
        </Link>
        <Link to="/customers" className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <UserPlus size={16} className="text-purple-600" /> Add Customer
        </Link>
        {user?.role === 'owner' && (
          <Link to="/reports" className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <BarChart3 size={16} className="text-orange-600" /> View Reports
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Sales" value={formatCurrency(stats.todaySales)} icon={IndianRupee} color="green" />
        <StatCard title="Today's Bills" value={stats.todayBillsCount} icon={Receipt} color="blue" />
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="purple" />
        <StatCard title="Total Stock Qty" value={stats.totalStockQty} icon={Boxes} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sales — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h3 className="font-semibold text-slate-800">Low Stock</h3>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-400">All products are well stocked.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{p.name}</span>
                  <span className={`font-medium ${p.stockStatus === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-orange-600'}`}>
                    {p.stockQty} / {p.lowStockThreshold}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Bills</h3>
        {stats.recentBills.length === 0 ? (
          <p className="text-sm text-slate-400">No bills yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentBills.map((bill) => (
              <Link
                key={bill._id}
                to={`/invoices/${bill._id}`}
                className="flex justify-between items-center py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{bill.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">
                    {bill.customer?.name || 'Walk-in Customer'} • {formatDateTime(bill.createdAt)}
                  </p>
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
