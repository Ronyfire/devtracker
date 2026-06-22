import api from "./api";

export const getApplications = () => api.get("/api/applications/");
export const getApplication = (id) => api.get(`/api/applications/${id}`);
export const createApplication = (data) => api.post("/api/applications/", data);
export const updateApplication = (id, data) => api.put(`/api/applications/${id}`, data);
export const deleteApplication = (id) => api.delete(`/api/applications/${id}`);
export const addStatus = (id, data) => api.post(`/api/applications/${id}/status`, data);
export const getHistory = (id) => api.get(`/api/applications/${id}/history`);
