import { z } from "zod";

/**
 * Schema 扩展工具集
 * 用于在前端扩展 contracts 中的基础 schema，添加前端特定的验证逻辑
 */

/**
 * 为 schema 添加异步 refine 校验
 *
 * @example
 * ```ts
 * const CreateUserSchema = withAsyncRefine(
 *   userCreateSchema,
 *   async (data) => {
 *     const isAvailable = await checkUserAccount(data.account);
 *     return isAvailable;
 *   },
 *   { message: "账号已存在", path: ["account"] }
 * );
 * ```
 */
export function withAsyncRefine<T extends z.ZodTypeAny>(
  schema: T,
  refineFn: (data: z.infer<T>) => Promise<boolean>,
  params: Parameters<(typeof schema)["refine"]>[1]
) {
  return schema.refine(refineFn, params);
}

/**
 * 为 schema 添加同步 refine 校验
 *
 * @example
 * ```ts
 * const PasswordConfirmSchema = withRefine(
 *   passwordSchema,
 *   (data) => data.password === data.confirmPassword,
 *   { message: "两次密码不一致", path: ["confirmPassword"] }
 * );
 * ```
 */
export function withRefine<T extends z.ZodTypeAny>(
  schema: T,
  refineFn: (data: z.infer<T>) => boolean,
  params: Parameters<(typeof schema)["refine"]>[1]
) {
  return schema.refine(refineFn, params);
}

/**
 * 为 schema 添加带防抖的异步校验
 *
 * @example
 * ```ts
 * const CreateUserSchema = withDebouncedAsyncRefine(
 *   userCreateSchema,
 *   async (data) => {
 *     const isAvailable = await checkUserAccount(data.account);
 *     return isAvailable;
 *   },
 *   { message: "账号已存在", path: ["account"] },
 *   500  // 防抖延迟 500ms
 * );
 * ```
 */
export function withDebouncedAsyncRefine<T extends z.ZodTypeAny>(
  schema: T,
  refineFn: (data: z.infer<T>) => Promise<boolean>,
  params: Parameters<(typeof schema)["refine"]>[1],
  debounceMs: number = 500
) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const debouncedRefine = (data: z.infer<T>): Promise<boolean> => {
    return new Promise((resolve) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(async () => {
        try {
          const result = await refineFn(data);
          resolve(result);
        } finally {
          debounceTimer = null;
        }
      }, debounceMs);
    });
  };

  return schema.refine(debouncedRefine, params);
}

/**
 * 创建确认密码 schema
 * 自动添加密码和确认密码的校验
 *
 * @example
 * ```ts
 * const PasswordFormSchema = createPasswordConfirmSchema(
 *   z.object({ password: passwordSchema })
 * );
 * ```
 */
export function createPasswordConfirmSchema<T extends z.ZodObject<any>>(
  baseSchema: T
) {
  const passwordSchema = baseSchema.shape.password;
  return baseSchema
    .extend({
      confirmPassword: passwordSchema,
    })
    .refine((data: any) => data.password === data.confirmPassword, {
      message: "两次输入的密码不一致",
      path: ["confirmPassword"],
    });
}

/**
 * 条件必填字段
 * 根据条件决定字段是否必填
 *
 * @example
 * ```ts
 * const FormSchema = z.object({
 *   type: z.enum(["A", "B"]),
 *   fieldA: conditionalRequiredField(z.string(), (data) => data.type === "A"),
 *   fieldB: conditionalRequiredField(z.string(), (data) => data.type === "B"),
 * });
 * ```
 */
export function conditionalRequiredField<T extends z.ZodTypeAny>(
  fieldSchema: T,
  condition: (data: any) => boolean,
  message: string = "该字段为必填项"
) {
  return z.any().superRefine((val, ctx) => {
    const parent = (ctx as any).data;
    if (condition(parent)) {
      const result = fieldSchema.safeParse(val);
      if (!result.success) {
        result.error.issues.forEach((err: any) => {
          ctx.addIssue({
            ...err,
            message: err.message === "Required" ? message : err.message,
          });
        });
      }
    }
  });
}
