import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { DatabaseSeedService } from './common/database/database.seed.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('开始执行数据库初始化脚本...');

  try {
    // 使用 createApplicationContext 创建一个非 HTTP 运行环境
    // 虽然是非http环境，但是整个应用的模块都会被加载，包括数据库的连接等。
    const app = await NestFactory.createApplicationContext(SeedModule);
    const seedService = app.get(DatabaseSeedService);

    await seedService.seed();

    logger.log('数据库初始化脚本执行完毕。');
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('数据库初始化脚本执行失败!', error);
    process.exit(1);
  }
}

bootstrap();
