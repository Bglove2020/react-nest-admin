import { z } from "zod";

/**
 * 统一的 API 响应 schema
 * 用于验证后端返回的响应格式
 */

// 成功响应代码
export const SUCCESS_CODE = 200;

// 基础 API 响应 schema
export const apiResponseSchema = <TData extends z.ZodType>(dataSchema: TData) =>
  z.object({
    code: z.number(),
    msg: z.string(),
    data: dataSchema,
  });

/**
 * 列表响应 schema
 * 用于返回数据列表的接口
 */
export const listResponseSchema = <TData extends z.ZodType>(dataSchema: TData) =>
  z.object({
    code: z.number(),
    msg: z.string(),
    data: z.array(dataSchema),
  });

/**
 * ���页响应 schema
 * 用于返回分页数据的接口
 */
export const paginatedResponseSchema = <TData extends z.ZodType>(
  dataSchema: TData
) =>
  z.object({
    code: z.number(),
    msg: z.string(),
    data: z.object({
      list: z.array(dataSchema),
      total: z.number(),
    }),
  });

/**
 * 无数据响应 schema
 * 用于不需要返回数据的操作（如删除、更新等）
 */
export const noDataResponseSchema = z.object({
  code: z.number(),
  msg: z.string(),
  data: z.null().or(z.undefined()),
});

/**
 * 创建成功响应的类型推断工具
 */
export type ApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

export type ListResponse<T> = {
  code: number;
  msg: string;
  data: T[];
};

export type PaginatedResponse<T> = {
  code: number;
  msg: string;
  data: {
    list: T[];
    total: number;
  };
};
