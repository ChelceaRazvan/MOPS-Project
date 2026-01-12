import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Request failed";
    return Promise.reject(new Error(`${detail} (${status ?? "no status"})`));
  }
);

export default api;
