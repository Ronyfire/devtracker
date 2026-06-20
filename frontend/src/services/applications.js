import api from "./api";

export const getApplications = () => api.get("/api/applications/");
export const createApplication = (data) => api.post("/api/applications/", data);
export const deleteApplication = (id) => api.delete(`/api/applications/${id}`);
export const addStatus = (id, data) => api.post(`/api/applications/${id}/status`, data);
export const getHistory = (id) => api.get(`/api/applications/${id}/history`);
