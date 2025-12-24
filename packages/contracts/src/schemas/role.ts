import { z } from "zod";
import {
  nameSchema,
  publicIdSchema,
  sortOrderSchema,
  statusSchema,
} from "./common";

export const roleCreateSchema = z.object({
  name: nameSchema,
  roleKey: z.string().min(1, "请输入角色权限字符串"),
  sortOrder: sortOrderSchema,
  status: statusSchema,
  dataScope: z.string().optional(),
  menuIds: z.array(publicIdSchema).optional(),
});

export const roleUpdateSchema = roleCreateSchema.extend({
  publicId: publicIdSchema,
});

export type RoleCreatePayload = z.infer<typeof roleCreateSchema>;
export type RoleUpdatePayload = z.infer<typeof roleUpdateSchema>;
