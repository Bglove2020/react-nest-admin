import { z } from "zod";

/**
 * 分页参数 Zod Schema
 * 用于 nest-zod 自动生成 DTO
 * pageNum 和 pageSize 为可选参数，不传时查询全部数据
 */
export const pageParamsSchema = z.object({
  pageNum: z.coerce
    .number()
    .min(0)
    .optional()
    .describe("页码，从0开始（不传时查询全部）"),
  pageSize: z.coerce
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("每页条数，最大100（不传时查询全部）"),
});

/**
 * 排序参数 Zod Schema
 */
export const sortParamsSchema = z.object({
  sortField: z.string().optional().describe("排序字段"),
  sortOrder: z.enum(["asc", "desc"]).optional().describe("排序方向：asc-升序，desc-降序"),
});

/**
 * 分页响应 Zod Schema
 * 用于定义后端返回的分页数据格式
 */
export const paginatedDataSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    list: z.array(itemSchema).describe("当前页数据列表"),
    total: z.number().describe("总记录数"),
  });

export type PageParams = z.infer<typeof pageParamsSchema>;
export type SortParams = z.infer<typeof sortParamsSchema>;

// 辅助类型，用于推断分页数据
export type PaginatedData<T> = {
  list: T[];
  total: number;
};
