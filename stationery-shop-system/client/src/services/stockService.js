import api from './api';

export const addStock = (data) => api.post('/stock/add', data);
export const adjustStock = (data) => api.post('/stock/adjust', data);
export const getMovements = (params) => api.get('/stock/movements', { params });
