import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleListDto } from './dto/role-list.dto';
import type { FrontendRole } from '@ruoyi/contracts';
import { toFrontendDtoList } from './mapper/to-frontend-user.mapper';
import { RequirePerms } from '@/auth/decorators/perms.decorator';

@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @RequirePerms('system:role:add')
  @Post('create')
  async create(@Body() createRoleDto: CreateRoleDto) {
    await this.roleService.create(createRoleDto);
    return {
      code: 200,
      msg: '角色创建成功',
      data: null,
      logdata: { roleName: createRoleDto.roleName },
    };
  }

  @RequirePerms('system:role:list')
  @Get('list')
  async list(@Query() query: RoleListDto) {
    const { list, total } = await this.roleService.list(query);
    const data: FrontendRole[] = toFrontendDtoList(list);
    return {
      code: 200,
      msg: '角色列表获取成功',
      data: {
        list: data,
        total,
      },
      logdata: { count: data.length, total },
    };
  }

  @RequirePerms('system:role:update')
  @Post('update')
  async update(@Body() updateRoleDto: UpdateRoleDto) {
    await this.roleService.update(updateRoleDto);
    return {
      code: 200,
      msg: '角色更新成功',
      data: null,
      logdata: { roleId: updateRoleDto.roleId },
    };
  }

  @RequirePerms('system:role:delete')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    await this.roleService.delete(id);
    return {
      code: 200,
      msg: '角色删除成功',
      data: null,
      logdata: { roleId: id },
    };
  }
}
