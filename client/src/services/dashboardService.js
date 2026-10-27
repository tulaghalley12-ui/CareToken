import api from './api';

export const dashboardService = {
  getAdminDashboard: async () => {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },

  getDoctorDashboard: async () => {
    const res = await api.get('/dashboard/doctor');
    return res.data;
  },

  getReceptionistDashboard: async () => {
    const res = await api.get('/dashboard/receptionist');
    return res.data;
  },

  getPatientDashboard: async () => {
    const res = await api.get('/dashboard/patient');
    return res.data;
  }
};
