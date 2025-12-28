import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { SysRole } from './entities/role.entity';
import { SysMenu } from '../menu/entities/menu.entity';
import { SysUser } from '../user/entities/user.entity';
import { CommonRedisModule } from '@/common/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysRole, SysMenu, SysUser]),
    CommonRedisModule,
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
