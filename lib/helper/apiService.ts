import axios, { AxiosError } from "axios";
import { getSessionToken, clearSession } from "./session";

export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearSession();
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const res = await http.get<T>(url, { params });
  return res.data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await http.post<T>(url, body);
  return res.data;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await http.put<T>(url, body);
  return res.data;
}

export async function del<T>(url: string, body?: unknown): Promise<T> {
  const res = await http.delete<T>(url, { data: body });
  return res.data;
}

export function getApiError(err: unknown): string {
  const error = err as AxiosError<{ error?: string; message?: string }>;
  return (
    error.response?.data?.error ||
    error.response?.data?.message ||
    "Terjadi kesalahan"
  );
}
