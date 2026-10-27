import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  registerPatient: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  registerStaff: async (data) => {
    const res = await api.post('/auth/register-staff', data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('caretoken_token');
      localStorage.removeItem('caretoken_user');
    }
  }
};
