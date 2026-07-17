import api from './axios.js';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async register({ full_name, email, password, country, phone, company_name }) {
    const { data } = await api.post('/auth/register', {
      full_name, email, password, country, phone, company_name
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
  }
};
