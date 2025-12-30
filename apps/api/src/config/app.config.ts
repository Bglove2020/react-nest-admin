import { registerAs } from '@nestjs/config';

/**
 * 应用级配置
 */
export default registerAs('app', () => {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  return {
    // 应用端口
    port: parseInt(process.env.PORT || '3000', 10),
    // 环境
    env: process.env.NODE_ENV || 'development',
    // CORS 允许的源
    corsAllowedOrigins: allowedOrigins,
  };
});
