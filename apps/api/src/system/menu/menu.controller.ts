import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCode, type ApiResponse } from '@ruoyi/contracts';
import type { FrontendMenu } from '@ruoyi/contracts';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { RequirePerms } from '@/auth/decorators/perms.decorator';
import { toFrontendDto } from './mapper/to-fronted_menu';

@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @RequirePerms('system:menu:add')
  @Post('create')
  async create(@Body() createMenuDto: CreateMenuDto): Promise<ApiResponse<null>> {
    await this.menuService.create(createMenuDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '菜单创建成功',
      data: null,
    };
  }

  @RequirePerms('system:menu:list')
  @Get('list')
  async list(): Promise<ApiResponse<FrontendMenu[]>> {
    const data = await this.menuService.list();
    return {
      code: ApiCode.SUCCESS,
      msg: '菜单列表获取成功',
      data,
    };
  }

  @RequirePerms('system:menu:query')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<FrontendMenu>> {
    const menu = await this.menuService.get(id);
    const data = { ...toFrontendDto(menu), children: [] };
    return {
      code: ApiCode.SUCCESS,
      msg: '菜单获取成功',
      data,
    };
  }

  @RequirePerms('system:menu:update')
  @Post('update')
  async update(@Body() updateMenuDto: UpdateMenuDto): Promise<ApiResponse<null>> {
    await this.menuService.update(updateMenuDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '菜单更新成功',
      data: null,
    };
  }

  @RequirePerms('system:menu:delete')
  @Delete('delete')
  async delete(@Query('id') id: string): Promise<ApiResponse<null>> {
    await this.menuService.delete(id);
    return {
      code: ApiCode.SUCCESS,
      msg: '菜单删除成功',
      data: null,
    };
  }
}
