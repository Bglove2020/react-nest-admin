import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import loggingConfig from './config/logging.config';
import { LoggingModule } from './common/logging/logging.module';
import { LoggingService } from './common/logging/logging.service';
import { TypeOrmLoggerService } from './common/typeorm/typeorm-logger.service';
import { DatabaseSeedService } from './common/database/database.seed.service';
import { AlsModule } from './common/als/als.module';

// 实体导入
import { SysUser } from './system/user/entities/user.entity';
import { SysRole } from './system/role/entities/role.entity';
import { SysDept } from './system/dept/entities/dept.entity';
import { SysMenu } from './system/menu/entities/menu.entity';
import { SysDict } from './system/dict/entities/dict.entity';
import { SysDictData } from './system/dict/entities/dict-data.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [databaseConfig, loggingConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggingModule],
      useFactory: (
        configService: ConfigService,
        loggingService: LoggingService,
      ) => ({
        ...configService.get('database'), // 假设 databaseConfig 已经封装好了所有字段
        entities: [SysUser, SysRole, SysDept, SysMenu, SysDict, SysDictData],
        logging: process.env.ENABLE_SQL_LOGGING !== 'false',
        logger: new TypeOrmLoggerService(loggingService),
        synchronize: true, // 初始化脚本通常需要同步表结构
      }),
      inject: [ConfigService, LoggingService],
    }),
    TypeOrmModule.forFeature([
      SysUser,
      SysRole,
      SysDept,
      SysMenu,
      SysDict,
      SysDictData,
    ]),
    LoggingModule,
  ],
  providers: [DatabaseSeedService],
})
export class SeedModule {}
