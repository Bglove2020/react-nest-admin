import { z } from "zod";
import {
  accountSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  publicIdSchema,
  sexSchema,
  statusSchema,
} from "./common";

export const userCreateSchema = z.object({
  account: accountSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  sex: sexSchema,
  deptPublicId: publicIdSchema.optional(),
  rolePublicIds: z.array(publicIdSchema).optional(),
  status: statusSchema,
});

export const userCreateFormSchema = userCreateSchema
  .extend({
    deptPublicId: publicIdSchema,
    rolePublicIds: z.array(publicIdSchema).min(1, "请至少选择一个角色"),
    confirmPassword: passwordSchema,
    status: statusSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "\u4e24\u6b21\u8f93\u5165\u7684\u5bc6\u7801\u4e0d\u4e00\u81f4",
    path: ["confirmPassword"],
  });

export const userUpdateSchema = z.object({
  publicId: publicIdSchema,
  name: nameSchema,
  sex: sexSchema,
  status: statusSchema,
  deptPublicId: publicIdSchema,
  rolePublicIds: z.array(publicIdSchema).min(1, "请至少选择一个角色"),
});

export const userResetPasswordSchema = z.object({
  publicId: publicIdSchema,
  password: passwordSchema,
});

export type UserCreatePayload = z.infer<typeof userCreateSchema>;
export type UserCreateForm = z.infer<typeof userCreateFormSchema>;
export type UserUpdatePayload = z.infer<typeof userUpdateSchema>;
export type UserResetPasswordPayload = z.infer<typeof userResetPasswordSchema>;
