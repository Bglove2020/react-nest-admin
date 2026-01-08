import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosRequestHeaders,
} from "axios";
import type { ApiResponse } from "@ruoyi/contracts";
import { toast } from "sonner";

export type RetryOptions = {
  showErrorToast?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
  retryOnNetworkError?: boolean;
  retryMethods?: Array<
    "get" | "post" | "put" | "patch" | "delete" | "head" | "options"
  >;
};

type InternalConfig = AxiosRequestConfig &
  RetryOptions & { __retryCount?: number; __isRetry?: boolean };

let ACCESS_TOKEN: string | null = null;

export function setAccessToken(token: string | null) {
  console.log("=== Setting Access Token ===", token);
  ACCESS_TOKEN = token || null;
}

export function getAccessToken() {
  return ACCESS_TOKEN;
}

export function clearAccessToken() {
  ACCESS_TOKEN = null;
}

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5173/api",
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: axiosClient.defaults.baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  console.log("=== Refreshing Access Token ===");
  if (!refreshPromise) {
    console.log("=== No Refresh Promise, Creating New One ===");
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then((res) => {
        const token = res.data.data.accessToken ?? null;
        if (token) {
          setAccessToken(token);
        } else {
          clearAccessToken();
        }
        return token;
      })
      .catch(() => {
        clearAccessToken();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  console.log("=== Refresh Promise ===", refreshPromise);
  return refreshPromise;
}

axiosClient.interceptors.request.use((config) => {
  console.log("=== Request Config ===", config);
  const token = getAccessToken();
  console.log("=== Access Token ===", token);
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers["Authorization"] = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    console.log("=== Axios Error ===", error);
    const config = (error.config || {}) as InternalConfig;
    const status = error.response?.status;
    const message =
      (error.response?.data as ApiResponse<unknown> | undefined)?.msg ||
      error.message ||
      `HTTP ${status ?? ""}`;

    if (status === 401 && !config.__isRetry) {
      config.__isRetry = true;
      const newToken = await refreshAccessToken();
      console.log("=== New Access Token ===", newToken);
      if (newToken) {
        const headers = (config.headers ?? {}) as AxiosRequestHeaders;
        headers["Authorization"] = `Bearer ${newToken}`;
        config.headers = headers;
        try {
          return await axiosClient.request(config);
        } catch {
          // Retry failed, fall through
        }
      }
      clearAccessToken();
      if (config.showErrorToast !== false) {
        toast.error("登录已过期，请重新登录");
      }
      if (window.location.pathname !== "/auth/login") {
        location.assign("/auth/login");
      }
      return Promise.reject(error);
    }

    if (config.showErrorToast !== false) {
      toast.error(message || "请求失败");
    }
    return Promise.reject(error);
  },
);
