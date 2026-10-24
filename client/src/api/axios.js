import axios from "axios";

// const baseURL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:5000/api"
//     : "/api";

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : import.meta.env.VITE_API_URL;

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("repolens_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
