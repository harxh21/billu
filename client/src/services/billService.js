import api from './api';

export const createBill = (data) => api.post('/bills', data);
export const getBills = (params) => api.get('/bills', { params });
export const getBill = (id) => api.get(`/bills/${id}`);
