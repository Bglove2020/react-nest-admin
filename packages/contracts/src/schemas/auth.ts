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

export const registerBackendSchema = z.object({
  account: accountSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  sex: sexSchema,
});

export const registerFrontendSchema = registerBackendSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterBackendPayload = z.infer<typeof registerBackendSchema>;
export type RegisterFrontendPayload = z.infer<typeof registerFrontendSchema>;
