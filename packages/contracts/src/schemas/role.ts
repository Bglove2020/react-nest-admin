import { z } from "zod";
import { nameSchema, idSchema, sortOrderSchema, statusSchema } from "./common";

export const roleCreateSchema = z.object({
  name: nameSchema,
  roleKey: z.string().min(1, "请输入角色权限字符串"),
  sortOrder: sortOrderSchema,
  status: statusSchema,
  dataScope: z.string().optional(),
  menuIds: z.array(idSchema).optional(),
});

export const roleUpdateSchema = roleCreateSchema
  .extend({
    id: idSchema,
  })
  .partial()
  .extend({
    id: idSchema,
  });

export type RoleCreatePayload = z.infer<typeof roleCreateSchema>;
export type RoleUpdatePayload = z.infer<typeof roleUpdateSchema>;
