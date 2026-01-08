import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiCode, type ApiResponse } from '@ruoyi/contracts';
import type { FrontendDept } from '@ruoyi/contracts';
import { DeptService } from './dept.service';
import { CreateDeptDto } from './dto/create-dept.dto';
import { UpdateDeptDto } from './dto/update-dept.dto';
import { RequirePerms } from '@/auth/decorators/perms.decorator';

@Controller('system/dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @RequirePerms('system:dept:add')
  @Post('create')
  async create(@Body() createDeptDto: CreateDeptDto): Promise<ApiResponse<null>> {
    await this.deptService.create(createDeptDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '创建成功',
      data: null,
    };
  }

  @RequirePerms('system:dept:list')
  @Get('list')
  async list(): Promise<ApiResponse<FrontendDept[]>> {
    const result = await this.deptService.list();
    return {
      code: ApiCode.SUCCESS,
      msg: '查询成功',
      data: result,
    };
  }

  @RequirePerms('system:dept:update')
  @Post('update')
  async update(@Body() updateDeptDto: UpdateDeptDto): Promise<ApiResponse<null>> {
    await this.deptService.update(updateDeptDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '更新成功',
      data: null,
    };
  }

  @RequirePerms('system:dept:delete')
  @Delete('delete')
  async delete(@Query('id') id: string): Promise<ApiResponse<null>> {
    const { childCount, userCount } = await this.deptService.delete(id);
    const hasChild = childCount > 0;
    const hasUser = userCount > 0;
    let msg = '删除成功';
    if (hasChild && hasUser) {
      msg = `删除成功，包含${childCount}个子部门和${userCount}个用户`;
    } else if (hasChild) {
      msg = `删除成功，包含${childCount}个子部门`;
    } else if (hasUser) {
      msg = `删除成功，包含${userCount}个用户`;
    }
    return {
      code: ApiCode.SUCCESS,
      msg,
      data: null,
    };
  }
}
