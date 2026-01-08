/**
 * 统一的 API 响应类型定义
 * 仅保留 TypeScript 类型定义，移除不需要的 Zod Schema
 */

// 响应代码
export enum ApiCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  BIZ_ERROR = 10000, // 通用业务错误
}

/**
 * 基础 API 响应类型
 */
export type ApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

type PaginationData<T> = {
  list: T[];
  total: number;
};

export type PaginatedResponse<T> = ApiResponse<PaginationData<T>>;
