import api from './api';

export const patientService = {
  getPatients: async (search = '') => {
    const res = await api.get('/patients', { params: { search } });
    return res.data;
  },

  getPatientById: async (id) => {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },

  createWalkInPatient: async (data) => {
    const res = await api.post('/patients', data);
    return res.data;
  },

  updatePatient: async (id, data) => {
    const res = await api.put(`/patients/${id}`, data);
    return res.data;
  },

  getPatientAppointments: async (id) => {
    const res = await api.get(`/patients/${id}/appointments`);
    return res.data;
  },

  getPatientTokens: async (id) => {
    const res = await api.get(`/patients/${id}/tokens`);
    return res.data;
  }
};
