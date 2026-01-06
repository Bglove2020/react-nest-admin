import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
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

// 内部使用的配置类型，扩展了 AxiosRequestConfig
type InternalConfig = AxiosRequestConfig &
  RetryOptions & { __retryCount?: number; __isRetry?: boolean };

// // 环境变量调试信息
// console.log('=== Environment Variables Debug ===')
// console.log('import.meta.env exists:', !!import.meta.env)
// console.log('import.meta.env.VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)

// // 检查所有环境变量
// if (import.meta.env) {
//   console.log('All env vars:')
//   Object.entries(import.meta.env).forEach(([key, value]) => {
//     console.log(`${key}: ${value}`)
//   })
// }

// // 检查特定环境变量
// console.log('VITE_API_BASE_URL type:', typeof import.meta.env.VITE_API_BASE_URL)
// console.log('VITE_API_BASE_URL value:', JSON.stringify(import.meta.env.VITE_API_BASE_URL))

// In-memory access token store
let ACCESS_TOKEN: string | null = null;

export function setAccessToken(token: string | null) {
  console.log("=== Setting Access Token ===", token);
  ACCESS_TOKEN = token || null;
}

export function getAccessToken() {
  // console.log('=== Getting Access Token ===', ACCESS_TOKEN)
  return ACCESS_TOKEN;
}

export function clearAccessToken() {
  ACCESS_TOKEN = null;
}

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5173/api",
  withCredentials: true,
});

// A dedicated client for refresh endpoint without interceptors to avoid loops
const refreshClient = axios.create({
  baseURL: axiosClient.defaults.baseURL,
  withCredentials: true,
});

// 当refreshPromise的状态变为fullfill时，值是新的accessToken
// 当refreshPromise的状态变为reject时，值是null
// 但不管是成功还是失败，请求最后结束时，都会将refreshPromise重置为null

// 因此refreshPromise更多的其实是用来表示已经有一个刷新请求在进行中，防止refreshAccessToken()函数的重复进行
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
        // Optional: toast error only on explicit refresh failure to reduce noise
        // toast.error(err?.response?.data?.message || err.message || '刷新登录状态失败')
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
    // Axios v1 headers may be AxiosHeaders or a plain object; set safely
    if (config.headers) {
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    } else {
      config.headers = { Authorization: `Bearer ${token}` } as any;
    }
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
      (error.response?.data as any)?.message ||
      error.message ||
      `HTTP ${status ?? ""}`;

    // 这里的config.__isRetry在每个请求第一次返回401时，都是undefined，因为config上根本就没有这属性
    // 但是我们会在刷新accesstoken后，会使用这个config对象再发起一次请求
    // 如果刷新后的请求也返回401，没有config.__isRetry字段的话，就会无限循环，直到刷新成功或失败
    if (status === 401 && !config.__isRetry) {
      config.__isRetry = true;
      const newToken = await refreshAccessToken();
      console.log("=== New Access Token ===", newToken);
      if (newToken) {
        // Update auth header and retry original request
        if (config.headers) {
          (config.headers as any)["Authorization"] = `Bearer ${newToken}`;
        } else {
          config.headers = { Authorization: `Bearer ${newToken}` } as any;
        }
        try {
          // 使用上一次请求的配置对象重新发起请求，这个配置对象中包括上一次请求的所有信息，如method、url、data等。这里在config上挂载的自定义字段也会被包含在其中
          return await axiosClient.request(config);
        } catch {
          // If retry still fails, propagate
          // location.assign("/auth/login");
          // return Promise.reject(retryErr);
        }
      }
      // Refresh failed: clear token and redirect to login
      clearAccessToken();
      if (config.showErrorToast !== false) {
        toast.error("登录已过期，请重新登录");
      }
      // 如果当前不在登录页面，才进行跳转
      if (window.location.pathname !== "/auth/login") {
        location.assign("/auth/login");
      }
      return Promise.reject(error);
    }

    // Other errors
    if (config.showErrorToast !== false) {
      toast.error(message || "请求失败");
    }
    return Promise.reject(error);
  },
);
