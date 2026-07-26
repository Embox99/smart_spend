import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import type { ApiError } from "@shared/types";
import { BASE_URL } from "./apiPaths";
import { getToken, clearToken } from "./token";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401) {
      clearToken();
      // Replace rather than push so back does not return to a dead session.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    } else if (status === 429) {
      toast.error(
        error.response?.data?.message ?? "Too many requests. Please slow down."
      );
    } else if (status && status >= 500) {
      toast.error("Server error. Please try again.");
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please try again.");
    } else if (!error.response) {
      toast.error("Network error. Check your connection.");
    }

    return Promise.reject(error);
  }
);

/** Pulls the server's message out of an axios failure, with a fallback. */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export default axiosInstance;
