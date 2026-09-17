import api from './api';

export const getDashboardStats = () => api.get('/reports/dashboard');
export const getSalesChart = (range) => api.get('/reports/sales-chart', { params: { range } });
export const getBestSelling = (limit) => api.get('/reports/best-selling', { params: { limit } });
export const getStockReport = () => api.get('/reports/stock');
