import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as reportService from '../services/reportService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Table from '../components/common/Table';
import { formatCurrency } from '../utils/formatCurrency';

export default function Reports() {
  const [salesChart, setSalesChart] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [stockReport, setStockReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getSalesChart(30),
      reportService.getBestSelling(10),
      reportService.getStockReport(),
    ]).then(([salesRes, bestRes, stockRes]) => {
      setSalesChart(salesRes.data.data.map((d) => ({ date: d._id, sales: d.totalSales })));
      setBestSelling(bestRes.data.data);
      setStockReport(stockRes.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner size={32} />;

  const totalStockValue = stockReport.reduce((sum, p) => sum + p.stockQty * p.purchasePrice, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Reports</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Monthly Sales (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={salesChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Best-Selling Products</h3>
        <Table columns={['Product', 'Quantity Sold', 'Revenue']}>
          {bestSelling.map((p) => (
            <tr key={p._id}>
              <td className="px-4 py-3 text-sm text-slate-800">{p._id}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{p.totalQuantitySold}</td>
              <td className="px-4 py-3 text-sm font-medium text-slate-800">{formatCurrency(p.totalRevenue)}</td>
            </tr>
          ))}
        </Table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-800">Stock Report</h3>
          <span className="text-sm text-slate-500">Total Stock Value: <strong>{formatCurrency(totalStockValue)}</strong></span>
        </div>
        <Table columns={['Product', 'Category', 'Stock', 'Status']}>
          {stockReport.map((p) => (
            <tr key={p._id}>
              <td className="px-4 py-3 text-sm text-slate-800">{p.name}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{p.category}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{p.stockQty} {p.unit}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{p.stockStatus}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
