import api from './axios.js';

export const requestService = {
  async createRequest(formData) {
    // formData should be a FormData instance with images attached
    const { data } = await api.post('/requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async getRequests() {
    const { data } = await api.get('/requests');
    return data;
  },

  async getRequestById(id) {
    const { data } = await api.get(`/requests/${id}`);
    return data;
  },

  async acceptQuote(id) {
    const { data } = await api.put(`/requests/${id}/accept`);
    return data;
  },

  async getTrackingLogs(id) {
    const { data } = await api.get(`/requests/${id}/tracking`);
    return data;
  }
};
