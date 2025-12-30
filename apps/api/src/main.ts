import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';

async function bootstrap() {
  // 初始化事务上下文，必须在创建 Nest 应用之前调用
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 从配置读取 CORS 允许的源
  app.enableCors({
    origin: configService.get<string[]>('app.corsAllowedOrigins'),
    credentials: true,
  });

  // 从配置读取端口
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
}
bootstrap();
