import api from './axios.js';

export const supplierService = {
  async getAll() {
    const { data } = await api.get('/admin/suppliers');
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/admin/suppliers/${id}`);
    return data;
  },

  async create(supplierData) {
    const { data } = await api.post('/admin/suppliers', supplierData);
    return data;
  },

  async update(id, supplierData) {
    const { data } = await api.put(`/admin/suppliers/${id}`, supplierData);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/admin/suppliers/${id}`);
    return data;
  }
};
