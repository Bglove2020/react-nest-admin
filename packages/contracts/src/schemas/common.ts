import { z } from "zod";
import { zhCN } from "zod/locales";

z.config(zhCN());

export const accountSchema = z
  .string()
  .min(1, { message: "请输入账号" })
  .min(5, { message: "账号长度至少为5位" });

export const nameSchema = z.string().min(1, { message: "请输入名称" });

export const emailSchema = z.string().email({ message: "邮箱格式不正确" });

export const passwordComplexRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const passwordSchema = z
  .string()
  .min(1, { message: "请输入密码" })
  .min(8, { message: "密码长度至少为8位" })
  .regex(passwordComplexRegex, {
    message: "密码必须包含字母、数字和特殊字符",
  });

export const passwordMismatchMessage = "两次输入的密码不一致";

export const sexSchema = z.enum(["0", "1", "2"]);

export const statusSchema = z.enum(["0", "1"]);

export const publicIdSchema = z
  .string()
  .uuid({ message: "publicId 格式不正确" });

export const optionalPublicIdSchema = publicIdSchema
  .optional()
  .or(z.literal(""));

export const sortOrderSchema = z.number().int();
