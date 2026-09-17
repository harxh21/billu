import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import * as productService from '../services/productService';
import Table from '../components/common/Table';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../hooks/useAuth';

const statusStyles = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-orange-100 text-orange-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
};

const statusLabels = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        search: search || undefined,
        category: category || undefined,
        stockFilter: stockFilter || undefined,
        page,
        limit: 10,
      });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, stockFilter, page]);

  useEffect(() => {
    productService.getCategories().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(deleteTarget._id);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        {user?.role === 'owner' && (
          <Button onClick={() => navigate('/products/new')}>
            <span className="flex items-center gap-2"><Plus size={16} /> Add Product</span>
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or SKU..." />
        </div>
        <Select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          options={[{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c, label: c }))]}
        />
        <Select
          value={stockFilter}
          onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All Stock' },
            { value: 'IN_STOCK', label: 'In Stock' },
            { value: 'LOW_STOCK', label: 'Low Stock' },
            { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
          ]}
        />
      </div>

      {loading ? (
        <LoadingSpinner size={32} />
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
          No products found.
        </div>
      ) : (
        <>
          <Table columns={['Product', 'SKU', 'Category', 'Purchase Price', 'Selling Price', 'Stock', 'Status', 'Actions']}>
            {products.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.sku}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.category}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.purchasePrice)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.sellingPrice)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{p.stockQty} {p.unit}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[p.stockStatus]}`}>
                    {statusLabels[p.stockStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user?.role === 'owner' && (
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/products/${p._id}/edit`)} className="text-slate-400 hover:text-indigo-600">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
