import api, { setStoredToken, clearStoredAuth } from './axios.js';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data?.token) {
      setStoredToken(data.token);
    }
    if (data?.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async register({ full_name, email, password, country, country_code, phone, company_name }) {
    const { data } = await api.post('/auth/register', {
      full_name, email, password, country, country_code, phone, company_name,
    });
    return data;
  },

  async registerSupplier({ full_name, email, password, phone, country_code, company_name, category, factory_address, business_license }) {
    const { data } = await api.post('/auth/register/supplier', {
      full_name, email, password, phone, country_code, company_name, category, factory_address, business_license,
    });
    return data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async changePassword(newPassword) {
    const response = await api.post('/auth/change-password', { newPassword });
    if (response.data?.token) {
      setStoredToken(response.data.token);
    }
    return response.data;
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } finally {
      clearStoredAuth();
    }
  },

  // Buyer requests an offline password reset (Admin will generate a temp password).
  async requestPasswordReset(email) {
    const response = await api.post('/auth/password-reset', { email });
    return response.data;
  },

  async confirmPasswordReset(payload) {
    const response = await api.post('/auth/password-reset/confirm', payload);
    return response.data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Admin endpoints
  async getResetRequests(params = {}) {
    const response = await api.get('/admin/security/password-resets', { params });
    return response.data;
  },

  async processResetRequest(requestId) {
    const response = await api.post(`/admin/security/password-resets/${requestId}/process`);
    return response.data;
  },
};