import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import AddEditProduct from '../pages/AddEditProduct';
import Billing from '../pages/Billing';
import StockManagement from '../pages/StockManagement';
import Customers from '../pages/Customers';
import CustomerDetails from '../pages/CustomerDetails';
import SalesHistory from '../pages/SalesHistory';
import InvoiceDetails from '../pages/InvoiceDetails';
import Reports from '../pages/Reports';
import StaffManagement from '../pages/StaffManagement';
import Settings from '../pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AddEditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AddEditProduct />
            </ProtectedRoute>
          }
        />
        <Route path="/billing" element={<Billing />} />
        <Route
          path="/stock"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <StockManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/sales-history" element={<SalesHistory />} />
        <Route path="/invoices/:id" element={<InvoiceDetails />} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
