import { z } from "zod";
import {
  accountSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  idSchema,
  sexSchema,
  statusSchema,
} from "./common";

/**
 * 管理员创建用户 Schema
 * 用于管理员在用户管理中创建用户，必须指定部门和角色
 */
export const userCreateSchema = z.object({
  account: accountSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  sex: sexSchema,
  deptId: idSchema,
  roleIds: z.array(idSchema).min(1, "请至少选择一个角色"),
  status: statusSchema,
});

/**
 * 更新用户 Schema
 * 用于编辑用户信息
 */
export const userUpdateSchema = z.object({
  id: idSchema,
  name: nameSchema.optional(),
  sex: sexSchema.optional(),
  status: statusSchema.optional(),
  deptId: idSchema.optional(),
  roleIds: z.array(idSchema).optional(),
  avatar: z.string().optional(),
});

export const userResetPasswordSchema = z.object({
  id: idSchema,
  password: passwordSchema,
});

export type UserCreatePayload = z.infer<typeof userCreateSchema>;
export type UserUpdatePayload = z.infer<typeof userUpdateSchema>;
export type UserResetPasswordPayload = z.infer<typeof userResetPasswordSchema>;
