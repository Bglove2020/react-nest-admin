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
import { ApiCode, type ApiResponse, type PaginatedResponse } from '@ruoyi/contracts';
import type { FrontendDictData, FrontendDictType } from '@ruoyi/contracts';
import { DictService } from './dict.service';
import { RequirePerms } from '@/auth/decorators/perms.decorator';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';
import { DictListDto } from './dto/dict-list.dto';
import { DictDataListDto } from './dto/dict-data-list.dto';
import {
  toFrontendDictDataDtos,
  toFrontendDictTypeDto,
  toFrontendDictTypeDtos,
} from './mapper/dict.mapper';

@Controller('/system/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @RequirePerms('system:dict:list')
  @Get('list')
  async list(
    @Query() query: DictListDto,
  ): Promise<PaginatedResponse<FrontendDictType>> {
    const { list, total } = await this.dictService.list(query);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典列表获取成功',
      data: {
        list: toFrontendDictTypeDtos(list),
        total,
      },
    };
  }

  @RequirePerms('system:dict:query')
  @Get('type/:type')
  async getByType(
    @Param('type') type: string,
  ): Promise<ApiResponse<FrontendDictType>> {
    const dict = await this.dictService.getByType(type);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典获取成功',
      data: toFrontendDictTypeDto(dict),
    };
  }

  @RequirePerms('system:dict:query')
  @Get(':id')
  async get(@Param('id') id: string): Promise<ApiResponse<FrontendDictType>> {
    const dict = await this.dictService.get(id);
    const frontendDict = toFrontendDictTypeDto(dict);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典获取成功',
      data: frontendDict,
    };
  }

  @RequirePerms('system:dict:add')
  @Post('create')
  async create(@Body() dto: CreateDictTypeDto): Promise<ApiResponse<null>> {
    await this.dictService.create(dto);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典创建成功',
      data: null,
    };
  }

  @RequirePerms('system:dict:edit')
  @Post('update')
  async update(@Body() dto: UpdateDictTypeDto): Promise<ApiResponse<null>> {
    await this.dictService.update(dto);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典更新成功',
      data: null,
    };
  }

  @RequirePerms('system:dict:remove')
  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.dictService.delete(id);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典删除成功',
      data: null,
    };
  }

  @RequirePerms('system:dict:list')
  @Get('data/list')
  async listData(
    @Query() query: DictDataListDto,
    @Query('type') type?: string,
  ): Promise<PaginatedResponse<FrontendDictData>> {
    if (!type) {
      throw new BadRequestException({
        msg: 'type 参数是必需的',
        code: ApiCode.BAD_REQUEST,
      });
    }
    const { list, total } = await this.dictService.dataList(query, type);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典数据列表获取成功',
      data: {
        list: toFrontendDictDataDtos(list),
        total,
      },
    };
  }

  @RequirePerms('system:dict:add')
  @Post('data/create')
  async createData(@Body() dto: CreateDictDataDto): Promise<ApiResponse<null>> {
    await this.dictService.createData(dto);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典数据创建成功',
      data: null,
    };
  }

  @RequirePerms('system:dict:edit')
  @Post('data/update')
  async updateData(@Body() dto: UpdateDictDataDto): Promise<ApiResponse<null>> {
    await this.dictService.updateData(dto);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典数据更新成功',
      data: null,
    };
  }

  @RequirePerms('system:dict:remove')
  @Delete('data/delete/:id')
  async deleteData(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.dictService.deleteData(id);
    return {
      code: ApiCode.SUCCESS,
      msg: '字典数据删除成功',
      data: null,
    };
  }
}
