import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";


export interface ApiError {
  status: number;
  message: string;
  detail?: unknown;
}


const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10_000, // fail fast rather than hang forever
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeError(error)),
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(normalizeError(error));
  },
);


function normalizeError(error: AxiosError): ApiError {
  if (error.response) {
    const payload = error.response.data as Record<string, unknown> | undefined;
    return {
      status: error.response.status,
      message:
        (payload?.message as string) ||
        (payload?.error as string) ||
        error.message,
      detail: payload,
    };
  }

  if (error.request) {
    return {
      status: 0,
      message: error.code === "ECONNABORTED" ? "انتهت مهلة الطلب" : "لا يوجد اتصال بالشبكة",
    };
  }

  return { status: -1, message: error.message };
}

export default axiosInstance;