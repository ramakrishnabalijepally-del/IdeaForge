import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(null)));
  failedQueue = [];
}

// Endpoints that must never trigger the refresh-token retry loop
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    const url = original?.url ?? "";

    // Never attempt refresh for auth endpoints or already-retried requests
    const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => url.endsWith(e));
    if (error.response?.status === 401 && !original?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original!));
      }

      original!._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(original!);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh token expired — clear auth state and redirect to login
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:expired"));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (!error.response) return "Unable to connect to server. Please check your connection.";
    if (status === 401) return "Invalid email or password.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 429) return "Too many requests. Please try again later.";
    if (status && status >= 500) return "Something went wrong. Please try again.";

    // Use backend validation message for 400/422 errors
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail[0]?.msg ?? "Validation error.";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
