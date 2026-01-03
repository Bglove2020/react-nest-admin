import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleListDto } from './dto/role-list.dto';
import { LoggingService } from '@/common/logging/logging.service';
import type { FrontendRole } from '@ruoyi/contracts';
import { toFrontendDtoList } from './mapper/to-frontend-user.mapper';
import { RequirePerms } from '@/auth/decorators/perms.decorator';

@Controller('system/role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly loggingService: LoggingService,
  ) {}

  @RequirePerms('system:role:add')
  @Post('create')
  async create(@Body() createRoleDto: CreateRoleDto) {
    this.loggingService.log('POST /system/role/create', {
      requestDescriptor: { data: createRoleDto },
    });

    await this.roleService.create(createRoleDto);

    this.loggingService.log('POST /system/role/create success');
    return { code: 200, msg: '角色创建成功', data: null };
  }

  @RequirePerms('system:role:list')
  @Get('list')
  async list(@Query() query: RoleListDto) {
    this.loggingService.log('GET /system/role/list', {
      params: query,
    });
    const { list, total } = await this.roleService.list(query);
    const data: FrontendRole[] = toFrontendDtoList(list);
    this.loggingService.log('GET /system/role/list success', {
      responseDescriptor: { type: 'list', count: data.length, total },
    });
    return {
      code: 200,
      msg: '角色列表获取成功',
      data: {
        list: data,
        total,
      },
    };
  }

  @RequirePerms('system:role:update')
  @Post('update')
  async update(@Body() updateRoleDto: UpdateRoleDto) {
    this.loggingService.log('POST /system/role/update', {
      requestDescriptor: { data: updateRoleDto },
    });
    await this.roleService.update(updateRoleDto);
    this.loggingService.log('POST /system/role/update success');
    return { code: 200, msg: '角色更新成功', data: null };
  }

  @RequirePerms('system:role:delete')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    this.loggingService.log('DELETE /system/role/delete/:id', {
      params: { id },
    });
    await this.roleService.delete(id);
    this.loggingService.log('DELETE /system/role/delete/:id success');
    return { code: 200, msg: '角色删除成功', data: null };
  }
}
