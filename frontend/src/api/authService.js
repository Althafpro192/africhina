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
  
  // [FIX Issue 2] Buyer: Request password reset from Admin (replaces legacy forgotPassword)
  async requestPasswordReset(email) {
    const response = await api.post('/auth/request-password-reset', { email })
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

  // [FIX Issue 1] Admin: Get pending password reset requests
  async getResetRequests() {
    const response = await api.get('/admin/reset-requests')
    return response.data
  },

  // [FIX Issue 1] Admin: Process a password reset request (generates real temp password)
  async processResetRequest(requestId) {
    const response = await api.post(`/admin/reset-requests/${requestId}/process`)
    return response.data
  }
};
