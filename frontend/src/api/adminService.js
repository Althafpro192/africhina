import api from './axios.js';

export const adminService = {
  async getAdminRequests() {
    const { data } = await api.get('/admin/requests');
    return data;
  },

  async getAdminRequestById(id) {
    const { data } = await api.get(`/admin/requests/${id}`);
    return data;
  },

  async updateRequest(id, formData) {
    // formData can be FormData (with QC images) or plain object
    const isFormData = formData instanceof FormData;
    const { data } = await api.put(`/admin/requests/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return data;
  },

  async getStatistics() {
    const { data } = await api.get('/admin/statistics');
    return data;
  },

  async sendEmail(requestId, { subject, body }) {
    const { data } = await api.post(`/admin/requests/${requestId}/email`, { subject, body });
    return data;
  }
};
