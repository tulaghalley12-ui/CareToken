import api from './api';

export const tokenService = {
  getMyTokens: async () => {
    const res = await api.get('/tokens/my-tokens');
    return res.data;
  },

  getTokenById: async (id) => {
    const res = await api.get(`/tokens/${id}`);
    return res.data;
  },

  trackTokenPublic: async (id) => {
    const res = await api.get(`/tokens/track/${id}`);
    return res.data;
  },

  getDepartmentQueue: async (departmentId, date) => {
    const res = await api.get(`/tokens/queue/${departmentId}`, {
      params: { date }
    });
    return res.data;
  },

  issueToken: async (data) => {
    const res = await api.post('/tokens', data);
    return res.data;
  },

  callToken: async (id) => {
    const res = await api.patch(`/tokens/${id}/call`);
    return res.data;
  },

  startConsultation: async (id) => {
    const res = await api.patch(`/tokens/${id}/start-consultation`);
    return res.data;
  },

  completeToken: async (id, notes = '') => {
    const res = await api.patch(`/tokens/${id}/complete`, { notes });
    return res.data;
  },

  skipToken: async (id, notes = '') => {
    const res = await api.patch(`/tokens/${id}/skip`, { notes });
    return res.data;
  },

  recallToken: async (id) => {
    const res = await api.patch(`/tokens/${id}/recall`);
    return res.data;
  },

  cancelToken: async (id, reason = '') => {
    const res = await api.patch(`/tokens/${id}/cancel`, { reason });
    return res.data;
  }
};
