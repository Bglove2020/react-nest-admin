import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCode, type ApiResponse, type PaginatedResponse } from '@ruoyi/contracts';
import type { FrontendRole } from '@ruoyi/contracts';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleListDto } from './dto/role-list.dto';
import { toFrontendDtoList } from './mapper/to-frontend-user.mapper';
import { RequirePerms } from '@/auth/decorators/perms.decorator';

@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @RequirePerms('system:role:add')
  @Post('create')
  async create(@Body() createRoleDto: CreateRoleDto): Promise<ApiResponse<null>> {
    await this.roleService.create(createRoleDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '角色创建成功',
      data: null,
    };
  }

  @RequirePerms('system:role:list')
  @Get('list')
  async list(
    @Query() query: RoleListDto,
  ): Promise<PaginatedResponse<FrontendRole>> {
    const { list, total } = await this.roleService.list(query);
    const data = toFrontendDtoList(list);
    return {
      code: ApiCode.SUCCESS,
      msg: '角色列表获取成功',
      data: {
        list: data,
        total,
      },
    };
  }

  @RequirePerms('system:role:update')
  @Post('update')
  async update(@Body() updateRoleDto: UpdateRoleDto): Promise<ApiResponse<null>> {
    await this.roleService.update(updateRoleDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '角色更新成功',
      data: null,
    };
  }

  @RequirePerms('system:role:delete')
  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.roleService.delete(id);
    return {
      code: ApiCode.SUCCESS,
      msg: '角色删除成功',
      data: null,
    };
  }
}
