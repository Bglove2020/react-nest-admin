import { z } from "zod";
import {
  optionalIdSchema,
  idSchema,
  sortOrderSchema,
  statusSchema,
} from "./common";

const isFrameSchema = z.enum(["0", "1"]);
const visibleSchema = z.enum(["0", "1"]);

// 前端专用的 discriminated union schemas（类型更安全）
const menuCatalogBaseSchema = z.object({
  menuType: z.literal("M"),
  name: z.string().min(1, "请输入菜单名称"),
  isFrame: isFrameSchema,
  visible: visibleSchema,
  sortOrder: sortOrderSchema,
  status: statusSchema,
  path: z.string().optional(),
});

const refineCatalogPath = (data: z.infer<typeof menuCatalogBaseSchema>) => {
  if (data.path && data.path.trim() !== "") return true;
  return data.isFrame === "0";
};

export const menuCatalogSchema = menuCatalogBaseSchema.refine(
  refineCatalogPath,
  {
    message: "\u5916\u94fe\u5fc5\u987b\u586b\u5199\u8def\u5f84",
    path: ["path"],
  }
);

const menuItemBaseSchema = z.object({
  menuType: z.literal("C"),
  parentId: optionalIdSchema,
  name: z.string().min(1, "请输入菜单名称"),
  perms: z.string().min(1, "请输入权限字符"),
  sortOrder: sortOrderSchema,
  isFrame: isFrameSchema,
  path: z.string().min(1, "请输入路由地址"),
  visible: visibleSchema,
  status: statusSchema,
});

export const menuItemSchema = menuItemBaseSchema;

const menuButtonBaseSchema = z.object({
  menuType: z.literal("F"),
  parentId: optionalIdSchema,
  name: z.string().min(1, "请输入按钮名称"),
  perms: z.string().min(1, "请输入权限字符"),
  sortOrder: sortOrderSchema,
  status: statusSchema,
});

export const menuButtonSchema = menuButtonBaseSchema;

/**
 * 前端专用：使用 discriminated union 获得更好的类型推断
 */
export const menuFormSchema = z.discriminatedUnion("menuType", [
  menuCatalogSchema,
  menuItemSchema,
  menuButtonSchema,
]);

/**
 * 后端专用：使用单一对象 schema，兼容 nestjs-zod
 * 所有字段都是可选的，由业务逻辑根据 menuType 进行验证
 */
export const menuCreateSchema = z.object({
  menuType: z.enum(["M", "C", "F"]),
  name: z.string().min(1, "请输入菜单名称"),
  parentId: optionalIdSchema.optional(),
  perms: z.string().optional(),
  isFrame: isFrameSchema.optional(),
  visible: visibleSchema.optional(),
  path: z.string().optional(),
  sortOrder: sortOrderSchema,
  status: statusSchema.optional(),
});

/**
 * 后端专用：更新 schema
 */
export const menuUpdateSchema = menuCreateSchema.extend({
  id: idSchema,
});

export type MenuFormPayload = z.infer<typeof menuFormSchema>;
export type MenuCreatePayload = z.infer<typeof menuCreateSchema>;
export type MenuUpdatePayload = z.infer<typeof menuUpdateSchema>;
