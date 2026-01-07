import type {
  ApiResponse,
  ListResponse,
  PaginatedResponse,
} from '@ruoyi/contracts';

/**
 * 内部响应类型（Controller 使用）
 * 包含可选的 logdata 字段用于日志记录
 *
 * 注意：这个类型仅在 API 内部使用，拦截器会在返回给前端前删除 logdata 字段
 */
export interface InternalApiResponse<T = any, L = any> {
  code: number;
  msg: string;
  data: T;
  logdata?: L; // 可选，仅用于日志，拦截器会删除此字段
}

// 重新导出共享包的类型，方便内部使用
export type { ApiResponse, ListResponse, PaginatedResponse };
