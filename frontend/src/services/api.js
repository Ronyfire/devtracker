import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (email, password) =>
  api.post("/api/auth/register", { email, password });

export const loginUser = (email, password) =>
  api.post("/api/auth/login", { email, password });

export default api;
