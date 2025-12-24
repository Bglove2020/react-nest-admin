import { z } from "zod";
import {
  optionalPublicIdSchema,
  publicIdSchema,
  sortOrderSchema,
  statusSchema,
} from "./common";

const isFrameSchema = z.enum(["0", "1"]);
const visibleSchema = z.enum(["0", "1"]);

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
  parentPublicId: optionalPublicIdSchema,
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
  parentPublicId: optionalPublicIdSchema,
  name: z.string().min(1, "请输入按钮名称"),
  perms: z.string().min(1, "请输入权限字符"),
  sortOrder: sortOrderSchema,
  status: statusSchema,
});

export const menuButtonSchema = menuButtonBaseSchema;

export const menuFormSchema = z.discriminatedUnion("menuType", [
  menuCatalogSchema,
  menuItemSchema,
  menuButtonSchema,
]);

export const menuCreateSchema = menuFormSchema;

export const menuUpdateSchema = z.discriminatedUnion("menuType", [
  menuCatalogBaseSchema
    .extend({ publicId: publicIdSchema })
    .refine(refineCatalogPath, {
      message: "\u5916\u94fe\u5fc5\u987b\u586b\u5199\u8def\u5f84",
      path: ["path"],
    }),
  menuItemBaseSchema.extend({ publicId: publicIdSchema }),
  menuButtonBaseSchema.extend({ publicId: publicIdSchema }),
]);

export type MenuFormPayload = z.infer<typeof menuFormSchema>;
export type MenuCreatePayload = z.infer<typeof menuCreateSchema>;
export type MenuUpdatePayload = z.infer<typeof menuUpdateSchema>;
