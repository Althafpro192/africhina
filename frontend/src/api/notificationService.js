import api from './axios.js';

export const notificationService = {
  async getNotifications() {
    const { data } = await api.get('/notifications');
    return data;
  },

  async markRead(id) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  async markAllRead() {
    const { data } = await api.post('/notifications/mark-all-read');
    return data;
  }
};
export default notificationService;
