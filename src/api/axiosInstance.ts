import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    // We access the store state directly for the interceptor
    // Note: useAuthStore.getState() is the way to access zustand state outside of components
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling (e.g., 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Auto-logout on 401
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
