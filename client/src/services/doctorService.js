import api from './api';

export const doctorService = {
  getDoctors: async (params = {}) => {
    const res = await api.get('/doctors', { params });
    return res.data;
  },

  getDoctorById: async (id) => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  updateDoctor: async (id, data) => {
    const res = await api.put(`/doctors/${id}`, data);
    return res.data;
  },

  getDoctorAppointments: async (id, params = {}) => {
    const res = await api.get(`/doctors/${id}/appointments`, { params });
    return res.data;
  },

  getDoctorQueue: async (id, date) => {
    const res = await api.get(`/doctors/${id}/queue`, { params: { date } });
    return res.data;
  },

  getDoctorSchedule: async (id) => {
    const res = await api.get(`/doctors/${id}/schedule`);
    return res.data;
  },

  updateDoctorSchedule: async (id, schedules) => {
    const res = await api.put(`/doctors/${id}/schedule`, { schedules });
    return res.data;
  }
};
