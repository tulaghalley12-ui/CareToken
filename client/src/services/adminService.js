import api from './api';

export const adminService = {
  getActivityLogs: async (params = {}) => {
    const res = await api.get('/activity-logs', { params });
    return res.data;
  },

  getHospitalSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },

  updateHospitalSettings: async (data) => {
    const res = await api.put('/settings', data);
    return res.data;
  }
};
