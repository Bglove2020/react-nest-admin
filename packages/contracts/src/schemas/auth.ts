import { z } from "zod";
import {
  accountSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  sexSchema,
} from "./common";

export const loginSchema = z.object({
  account: accountSchema,
  password: passwordSchema,
});

/**
 * 用户注册 Schema
 * 用于用户自行注册，不包含 deptId 和 roleIds
 * 这些字段由后端根据系统配置自动设置
 */
export const registerSchema = z.object({
  account: accountSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  sex: sexSchema,
});

export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;
