import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import type { FrontendMenu } from '@ruoyi/contracts';
import { RequirePerms } from '@/auth/decorators/perms.decorator';

@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @RequirePerms('system:menu:add')
  @Post('create')
  async create(@Body() createMenuDto: CreateMenuDto) {
    await this.menuService.create(createMenuDto);
    return {
      code: 200,
      msg: '菜单创建成功',
      data: null,
      logdata: { menuName: createMenuDto.name },
    };
  }

  @RequirePerms('system:menu:list')
  @Get('list')
  async list() {
    const data = await this.menuService.list();
    return {
      code: 200,
      msg: '菜单列表获取成功',
      data,
      logdata: { count: data.length },
    };
  }

  @RequirePerms('system:menu:query')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.menuService.get(id);
    return {
      code: 200,
      msg: '菜单获取成功',
      data,
      logdata: { menuId: id, menuName: data.name },
    };
  }

  @RequirePerms('system:menu:update')
  @Post('update')
  async update(@Body() updateMenuDto: UpdateMenuDto) {
    await this.menuService.update(updateMenuDto);
    return {
      code: 200,
      msg: '菜单更新成功',
      data: null,
      logdata: { menuId: updateMenuDto.id },
    };
  }

  @RequirePerms('system:menu:delete')
  @Delete('delete')
  async delete(@Query('id') id: string) {
    await this.menuService.delete(id);
    return {
      code: 200,
      msg: '菜单删除成功',
      data: null,
      logdata: { menuId: id },
    };
  }
}
