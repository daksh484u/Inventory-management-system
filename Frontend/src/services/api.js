import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) {
      error.response.data.detail = detail
        .map((d) => d.msg || JSON.stringify(d))
        .join("; ");
    }
    return Promise.reject(error);
  }
);

export default api;
