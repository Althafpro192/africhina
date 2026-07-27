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

  async updateRequest(id, payload) {
    const { data } = await api.put(`/admin/requests/${id}`, payload);
    return data;
  },

  async uploadMedia(id, formData) {
    const { data } = await api.post(`/admin/requests/${id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
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
  },

  async getMessages(id) {
    const { data } = await api.get(`/requests/${id}/messages`);
    return data;
  },

  async sendMessage(id, payload) {
    let data;
    if (payload instanceof FormData) {
      const res = await api.post(`/requests/${id}/messages`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      data = res.data;
    } else {
      const res = await api.post(`/requests/${id}/messages`, { content: payload });
      data = res.data;
    }
    return data;
  },

  async editMessage(id, msgId, content) {
    const { data } = await api.put(`/requests/${id}/messages/${msgId}`, { content });
    return data;
  },

  async deleteMessage(id, msgId) {
    const { data } = await api.delete(`/requests/${id}/messages/${msgId}`);
    return data;
  },

  async uploadOptions(id, formData) {
    const { data } = await api.post(`/admin/requests/${id}/options`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async updateOption(requestId, optionId, formData) {
    const { data } = await api.put(`/admin/requests/${requestId}/options/${optionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async deleteOption(requestId, optionId) {
    const { data } = await api.delete(`/admin/requests/${requestId}/options/${optionId}`);
    return data;
  },

  async finalizeDeal(id, payload) {
    if (payload instanceof FormData) {
      const { data } = await api.post(`/admin/requests/${id}/finalize`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } else {
      const { data } = await api.post(`/admin/requests/${id}/finalize`, payload);
      return data;
    }
  },

  async verifyPayment(id) {
    const { data } = await api.put(`/payments/admin/${id}/verify`);
    return data;
  },

  async rejectPayment(id, reason) {
    const { data } = await api.put(`/payments/admin/${id}/reject`, { reason });
    return data;
  },

  async shipOrder(id) {
    const { data } = await api.post(`/admin/requests/${id}/ship`);
    return data;
  },

  async completeOrder(id) {
    const { data } = await api.post(`/admin/requests/${id}/complete`);
    return data;
  },

  async togglePublishRating(ratingId, is_published) {
    const { data } = await api.post(`/admin/ratings/${ratingId}/toggle-publish`, { is_published });
    return data;
  },

  // [NEW Issue 3] Buyer User Management
  async getBuyerList(search = '') {
    const params = search ? { search } : {};
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  async getBuyerProfile(userId) {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data;
  },

  // [NEW Issue 4] Block / Unblock Buyer
  async toggleBlockUser(userId) {
    const { data } = await api.post(`/admin/users/${userId}/toggle-block`);
    return data;
  },

  // Helper: Get all requests for conversation list
  async getAllRequests() {
    const { data } = await api.get('/admin/requests');
    return data?.data || data || [];
  }
};
