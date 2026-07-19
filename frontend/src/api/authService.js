import api from './axios.js';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async register({ full_name, email, password, country, country_code, phone, company_name }) {
    const { data } = await api.post('/auth/register', {
      full_name, email, password, country, country_code, phone, company_name
    });
    return data;
  },

  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  async updateProfile(data) {
    const response = await api.put('/auth/profile', data)
    return response.data
  },
  
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async executeResetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },

  async getResetRequests() {
    const response = await api.get('/auth/admin/reset-requests')
    return response.data
  },

  async generateResetLink(id) {
    const response = await api.post(`/auth/admin/reset-requests/${id}/generate`)
    return response.data
  }
};
