import { z } from 'zod';

/**
 * 环境变量验证 Schema
 *
 * 在应用启动时验证所有必需的环境变量。
 * 如果验证失败，应用会立即退出并显示清晰的错误信息。
 */
export const envValidationSchema = z
  .object({
    // === 应用配置 ===
    NODE_ENV: z
      .enum(['development', 'production', 'test'], {
        message:
          '环境变量：NODE_ENV需要是 development、production 或 test 之一',
      })
      .default('development'),
    PORT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .min(1, { message: '环境变量：PORT需要是 1-65535 之间的数字' })
          .max(65535, { message: '环境变量：PORT需要是 1-65535 之间的数字' }),
      )
      .default(3000),

    // === 数据库配置 ===
    mysql_host: z
      .string({ message: '环境变量：mysql_host需要是字符串类型' })
      .min(1, { message: '环境变量：mysql_host不能为空' }),
    mysql_port: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .min(1, { message: '环境变量：mysql_port需要是 1-65535 之间的数字' })
          .max(65535, {
            message: '环境变量：mysql_port需要是 1-65535 之间的数字',
          }),
      )
      .default(3306),
    mysql_username: z
      .string({ message: '环境变量：mysql_username需要是字符串类型' })
      .min(1, { message: '环境变量：mysql_username不能为空' }),
    mysql_password: z
      .string({ message: '环境变量：mysql_password需要是字符串类型' })
      .min(1, { message: '环境变量：mysql_password不能为空' }),
    mysql_database: z
      .string({ message: '环境变量：mysql_database需要是字符串类型' })
      .min(1, { message: '环境变量：mysql_database不能为空' }),

    // === Redis 配置 ===
    REDIS_HOST: z
      .string({ message: '环境变量：REDIS_HOST需要是字符串类型' })
      .default('localhost'),
    REDIS_PORT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .min(1, { message: '环境变量：REDIS_PORT需要是 1-65535 之间的数字' })
          .max(65535, {
            message: '环境变量：REDIS_PORT需要是 1-65535 之间的数字',
          }),
      )
      .default(6379),
    REDIS_PASSWORD: z
      .string({ message: '环境变量：REDIS_PASSWORD需要是字符串类型' })
      .optional()
      .transform((val) => val || undefined),
    REDIS_DB: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .min(0, { message: '环境变量：REDIS_DB需要是 0-15 之间的数字' })
          .max(15, { message: '环境变量：REDIS_DB需要是 0-15 之间的数字' }),
      )
      .default(0),
    REDIS_PREFIX: z
      .string({ message: '环境变量：REDIS_PREFIX需要是字符串类型' })
      .default(''),

    // === JWT 配置 ===
    JWT_ACCESS_SECRET: z
      .string({ message: '环境变量：JWT_ACCESS_SECRET需要是字符串类型' })
      .min(32, { message: '环境变量：JWT_ACCESS_SECRET至少需要 32 个字符' })
      .refine(
        (val) => val !== 'your_access_token_secret_key' && val !== 'change_me',
        { message: '环境变量：JWT_ACCESS_SECRET需要修改默认值' },
      ),
    JWT_ACCESS_EXPIRES_IN: z
      .string({ message: '环境变量：JWT_ACCESS_EXPIRES_IN需要是字符串类型' })
      .default('2h'),
    JWT_REFRESH_SECRET: z
      .string({ message: '环境变量：JWT_REFRESH_SECRET需要是字符串类型' })
      .min(32, { message: '环境变量：JWT_REFRESH_SECRET至少需要 32 个字符' })
      .refine(
        (val) => val !== 'your_refresh_token_secret_key' && val !== 'change_me',
        { message: '环境变量：JWT_REFRESH_SECRET需要修改默认值' },
      ),
    JWT_REFRESH_EXPIRES_IN: z
      .string({ message: '环境变量：JWT_REFRESH_EXPIRES_IN需要是字符串类型' })
      .default('7d'),

    // === 日志配置 ===
    LOG_DIR: z
      .string({ message: '环境变量：LOG_DIR需要是字符串类型' })
      .default('./logs'),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'], {
        message:
          '环境变量：LOG_LEVEL需要是 trace、debug、info、warn、error 或 fatal 之一',
      })
      .default('info'),
    ENABLE_SQL_LOGGING: z
      .string()
      .transform((val) => val === 'true')
      .default(true),
    MAX_QUERY_EXECUTION_TIME: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z.number().min(0, {
          message: '环境变量：MAX_QUERY_EXECUTION_TIME需要是非负数',
        }),
      )
      .default(1000),

    // === CORS 配置 ===
    CORS_ALLOWED_ORIGINS: z
      .string({ message: '环境变量：CORS_ALLOWED_ORIGINS需要是字符串类型' })
      .default('http://localhost:5173,http://127.0.0.1:5173'),

    // === 默认值配置（由 seed 自动生成） ===
    DEFAULT_DEPT_ID: z
      .string({ message: '环境变量：DEFAULT_DEPT_ID需要是字符串类型' })
      .optional(),
    DEFAULT_ROLE_ID: z
      .string({ message: '环境变量：DEFAULT_ROLE_ID需要是字符串类型' })
      .optional(),
    DEFAULT_USER_ROLE_ID: z
      .string({ message: '环境变量：DEFAULT_USER_ROLE_ID需要是字符串类型' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // 额外的交叉验证
    if (data.NODE_ENV === 'production' && data.mysql_password === 'change_me') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '环境变量：mysql_password生产环境需要修改默认值',
        path: ['mysql_password'],
      });
    }
  });

// 推断类型
export type EnvVars = z.infer<typeof envValidationSchema>;

/**
 * 验证函数
 * @param config 待验证的环境变量对象
 * @returns 验证通过后的对象
 */
export function validate(config: Record<string, any>) {
  try {
    return envValidationSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 格式化错误信息，使其更具可读性
      const formattedErrors = error.issues
        .map((err) => `[${err.path.join('.')}] ${err.message}`)
        .join('\n');
      throw new Error(`环境变量验证失败:\n${formattedErrors}`);
    }
    throw error;
  }
}
