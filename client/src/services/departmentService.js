import api from './api';

export const departmentService = {
  getDepartments: async (includeInactive = false) => {
    const res = await api.get(`/departments?includeInactive=${includeInactive}`);
    return res.data;
  },

  getDepartmentById: async (id) => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },

  createDepartment: async (data) => {
    const res = await api.post('/departments', data);
    return res.data;
  },

  updateDepartment: async (id, data) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },

  deleteDepartment: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  }
};
