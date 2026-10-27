import api from './api';

export const appointmentService = {
  getAvailableSlots: async (doctorId, date) => {
    const res = await api.get('/appointments/available-slots', {
      params: { doctorId, date }
    });
    return res.data;
  },

  bookAppointment: async (data) => {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  getAppointments: async (params = {}) => {
    const res = await api.get('/appointments', { params });
    return res.data;
  },

  getAppointmentById: async (id) => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  cancelAppointment: async (id, reason) => {
    const res = await api.patch(`/appointments/${id}/cancel`, { reason });
    return res.data;
  }
};
