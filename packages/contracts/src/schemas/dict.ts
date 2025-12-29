import { z } from "zod";
import { idSchema, sortOrderSchema, statusSchema } from "./common";

export const dictTypeCreateSchema = z.object({
  name: z.string().min(1, "请输入字典名称"),
  type: z.string().min(1, "请输入字典类型"),
  status: statusSchema,
  sortOrder: sortOrderSchema,
});

export const dictTypeUpdateSchema = dictTypeCreateSchema
  .extend({
    id: idSchema,
  })
  .partial()
  .extend({
    id: idSchema,
  });

export const dictDataCreateSchema = z.object({
  type: z.string().min(1, "请输入字典类型"),
  label: z.string().min(1, "请输入字典标签"),
  value: z.string().min(1, "请输入字典键值"),
  sortOrder: sortOrderSchema,
  status: statusSchema,
});

export const dictDataUpdateSchema = dictDataCreateSchema
  .extend({
    id: idSchema,
  })
  .partial()
  .extend({
    id: idSchema,
  });

export type DictTypeCreatePayload = z.infer<typeof dictTypeCreateSchema>;
export type DictTypeUpdatePayload = z.infer<typeof dictTypeUpdateSchema>;
export type DictDataCreatePayload = z.infer<typeof dictDataCreateSchema>;
export type DictDataUpdatePayload = z.infer<typeof dictDataUpdateSchema>;
