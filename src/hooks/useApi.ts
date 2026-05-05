import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, QueryKey } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { AxiosError, AxiosRequestConfig } from "axios";

// --- Types ---

type ApiError = AxiosError<{ message: string }>;

// --- GET Hook ---
export const useCustomGet = <TData, TError = ApiError>(
  queryKey: QueryKey,
  url: string,
  config?: AxiosRequestConfig,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) => {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const response = await axiosInstance.get<TData>(url, config);
      return response.data;
    },
    ...options,
  });
};

// --- POST Hook ---
export const useCustomPost = <TData, TVariables, TError = ApiError>(
  url: string,
  config?: AxiosRequestConfig,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const response = await axiosInstance.post<TData>(url, variables, config);
      return response.data;
    },
    ...options,
  });
};

// --- PUT Hook ---
export const useCustomPut = <TData, TVariables, TError = ApiError>(
  url: string,
  config?: AxiosRequestConfig,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const response = await axiosInstance.put<TData>(url, variables, config);
      return response.data;
    },
    ...options,
  });
};

// --- PATCH Hook ---
export const useCustomPatch = <TData, TVariables, TError = ApiError>(
  url: string,
  config?: AxiosRequestConfig,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const response = await axiosInstance.patch<TData>(url, variables, config);
      return response.data;
    },
    ...options,
  });
};

// --- DELETE Hook ---
export const useCustomDelete = <TData, TVariables = void, TError = ApiError>(
  url: string,
  config?: AxiosRequestConfig,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      // For delete, we might pass variables as part of the config (e.g. data or params)
      // or the URL might be dynamic. This is a standard implementation.
      const response = await axiosInstance.delete<TData>(url, {
        ...config,
        data: variables,
      });
      return response.data;
    },
    ...options,
  });
};
