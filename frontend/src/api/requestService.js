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
  },

  async selectOption(id, option_id) {
    const { data } = await api.post(`/requests/${id}/select-option`, { option_id });
    return data;
  },

  async uploadPaymentProof(id, formData) {
    const { data } = await api.post(`/payments/requests/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async confirmDelivery(id) {
    const { data } = await api.post(`/requests/${id}/confirm-delivery`);
    return data;
  },

  async cancelRequest(id, reason) {
    const { data } = await api.post(`/requests/${id}/cancel`, { reason });
    return data;
  },

  async disputeRequest(id, reason) {
    const { data } = await api.post(`/requests/${id}/dispute`, { reason });
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
  }
};
