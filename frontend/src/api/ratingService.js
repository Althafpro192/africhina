import api from './axios.js';

export const ratingService = {
  async createRating({ request_id, supplier_id, score, review }) {
    const { data } = await api.post('/ratings', { request_id, supplier_id, score, review });
    return data;
  },

  async getBySupplier(supplierId) {
    const { data } = await api.get(`/ratings/supplier/${supplierId}`);
    return data;
  },

  async getByRequest(requestId) {
    const { data } = await api.get(`/ratings/request/${requestId}`);
    return data;
  }
};
