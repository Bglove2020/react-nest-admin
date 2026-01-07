import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DictService } from './dict.service';
import { RequirePerms } from '@/auth/decorators/perms.decorator';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';
import { DictListDto } from './dto/dict-list.dto';
import { DictDataListDto } from './dto/dict-data-list.dto';
import {
  toFrontendDictDataDto,
  toFrontendDictDataDtos,
  toFrontendDictTypeDto,
  toFrontendDictTypeDtos,
} from './mapper/dict.mapper';
import type { FrontendDictData, FrontendDictType } from '@ruoyi/contracts';

@Controller('/system/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @RequirePerms('system:dict:list')
  @Get('list')
  async list(@Query() query: DictListDto) {
    const { list, total } = await this.dictService.list(query);
    return {
      code: 200,
      msg: '字典列表获取成功',
      data: {
        list: toFrontendDictTypeDtos(list),
        total,
      },
      logdata: { count: list.length, total },
    };
  }

  @RequirePerms('system:dict:query')
  @Get('type/:type')
  async getByType(@Param('type') type: string) {
    const dict = await this.dictService.getByType(type);
    return {
      code: 200,
      msg: '字典获取成功',
      data: toFrontendDictTypeDto(dict),
      logdata: { dictType: type, dictName: dict.name },
    };
  }

  @RequirePerms('system:dict:query')
  @Get(':id')
  async get(@Param('id') id: string) {
    const dict = await this.dictService.get(id);
    const frontendDict = toFrontendDictTypeDto(dict);
    return {
      code: 200,
      msg: '字典获取成功',
      data: frontendDict,
      logdata: { dictId: id, dictType: frontendDict.dictType },
    };
  }

  @RequirePerms('system:dict:add')
  @Post('create')
  async create(@Body() dto: CreateDictTypeDto) {
    await this.dictService.create(dto);
    return {
      code: 200,
      msg: '字典创建成功',
      data: null,
      logdata: { dictType: dto.dictType, dictName: dto.dictName },
    };
  }

  @RequirePerms('system:dict:edit')
  @Post('update')
  async update(@Body() dto: UpdateDictTypeDto) {
    await this.dictService.update(dto);
    return {
      code: 200,
      msg: '字典更新成功',
      data: null,
      logdata: { dictId: dto.dictId },
    };
  }

  @RequirePerms('system:dict:remove')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    await this.dictService.delete(id);
    return {
      code: 200,
      msg: '字典删除成功',
      data: null,
      logdata: { dictId: id },
    };
  }

  @RequirePerms('system:dict:list')
  @Get('data/list')
  async listData(
    @Query() query: DictDataListDto,
    @Query('type') type?: string,
  ): Promise<{
    code: number;
    msg: string;
    data: {
      list: FrontendDictData[];
      total: number;
    };
  }> {
    if (!type) {
      throw new BadRequestException({ msg: 'type 参数是必需的', code: 400 });
    }
    const { list, total } = await this.dictService.dataList(query, type);
    return {
      code: 200,
      msg: '字典数据列表获取成功',
      data: {
        list: toFrontendDictDataDtos(list),
        total,
      },
      logdata: { dictType: type, count: list.length, total },
    };
  }

  @RequirePerms('system:dict:add')
  @Post('data/create')
  async createData(@Body() dto: CreateDictDataDto) {
    await this.dictService.createData(dto);
    return {
      code: 200,
      msg: '字典数据创建成功',
      data: null,
      logdata: { dictCode: dto.dictCode, dictLabel: dto.dictLabel },
    };
  }

  @RequirePerms('system:dict:edit')
  @Post('data/update')
  async updateData(@Body() dto: UpdateDictDataDto) {
    await this.dictService.updateData(dto);
    return {
      code: 200,
      msg: '字典数据更新成功',
      data: null,
      logdata: { dictDataId: dto.dictDataId },
    };
  }

  @RequirePerms('system:dict:remove')
  @Delete('data/delete/:id')
  async deleteData(@Param('id') id: string) {
    await this.dictService.deleteData(id);
    return {
      code: 200,
      msg: '字典数据删除成功',
      data: null,
      logdata: { dictDataId: id },
    };
  }
}
