import axios from "axios";

const TOKEN_KEY = "chikuprop_token";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach Bearer token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — skip for login/signup endpoints
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/signup");

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent("auth:unauthorized", {
        detail: { path: window.location.pathname }
      }));
    }
    return Promise.reject(error);
  }
);

export const getProperties = (params) => API.get("/properties", { params });
export const getPropertyById = (id) => API.get(`/properties/${id}`);

export default API;
