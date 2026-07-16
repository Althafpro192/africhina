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
    const { data } = await api.get('/auth/me');
    return data;
  }
};
