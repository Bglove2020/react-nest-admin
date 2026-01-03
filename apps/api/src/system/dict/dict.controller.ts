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
import { LoggingService } from '@/common/logging/logging.service';
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
  constructor(
    private readonly dictService: DictService,
    private readonly loggingService: LoggingService,
  ) {}

  // 已更新
  @RequirePerms('system:dict:list')
  @Get('list')
  async list(@Query() query: DictListDto): Promise<{
    code: number;
    msg: string;
    data: {
      list: FrontendDictType[];
      total: number;
    };
  }> {
    this.loggingService.log('GET /system/dict/list', {
      params: query,
    });
    const { list, total } = await this.dictService.list(query);
    this.loggingService.log('GET /system/dict/list success', {
      responseDescriptor: { type: 'list', count: list.length, total },
    });
    return {
      code: 200,
      msg: '字典列表获取成功',
      data: {
        list: toFrontendDictTypeDtos(list),
        total,
      },
    };
  }

  // 已更新
  @RequirePerms('system:dict:query')
  @Get('type/:type')
  async getByType(@Param('type') type: string) {
    this.loggingService.log('GET /system/dict/type/:type', {
      params: { type },
    });
    const dict = await this.dictService.getByType(type);
    this.loggingService.log('GET /system/dict/type/:type success');
    return {
      code: 200,
      msg: '字典获取成功',
      data: toFrontendDictTypeDto(dict),
    };
  }

  // 已更新
  @RequirePerms('system:dict:query')
  @Get(':id')
  async get(@Param('id') id: string) {
    this.loggingService.log('GET /system/dict/:id', {
      params: { id },
    });
    const dict = await this.dictService.get(id);
    this.loggingService.log('GET /system/dict/:id success', {
      responseDescriptor: { data: toFrontendDictTypeDto(dict) },
    });
    return {
      code: 200,
      msg: '字典获取成功',
      data: toFrontendDictTypeDto(dict),
    };
  }

  // 已更新
  @RequirePerms('system:dict:add')
  @Post('create')
  async create(@Body() dto: CreateDictTypeDto) {
    this.loggingService.log('POST /system/dict/create', {
      requestDescriptor: { data: dto },
    });
    await this.dictService.create(dto);
    this.loggingService.log('POST /system/dict/create success');
    return { code: 200, msg: '字典创建成功', data: null };
  }

  // 已更新
  @RequirePerms('system:dict:edit')
  @Post('update')
  async update(@Body() dto: UpdateDictTypeDto) {
    this.loggingService.log('POST /system/dict/update', {
      requestDescriptor: { data: dto },
    });
    await this.dictService.update(dto);
    this.loggingService.log('POST /system/dict/update success');
    return { code: 200, msg: '字典更新成功', data: null };
  }

  // 已更新
  @RequirePerms('system:dict:remove')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    this.loggingService.log('DELETE /system/dict/delete/:id', {
      params: { id },
    });
    await this.dictService.delete(id);
    this.loggingService.log('DELETE /system/dict/delete/:id success');
    return { code: 200, msg: '字典删除成功', data: null };
  }

  // 已更新
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
    this.loggingService.log('GET /system/dict/data/list', {
      query: { ...query, type },
    });
    if (!type) {
      throw new BadRequestException({ msg: 'type 参数是必需的', code: 400 });
    }
    const { list, total } = await this.dictService.dataList(query, type);
    this.loggingService.log('GET /system/dict/data/list success', {
      responseDescriptor: { type: 'list', count: list.length, total },
    });
    return {
      code: 200,
      msg: '字典数据列表获取成功',
      data: {
        list: toFrontendDictDataDtos(list),
        total,
      },
    };
  }

  // @RequirePerms('system:dict:query')
  // @Get('data/:id')
  // async getData(@Param('id') id: string) {
  //   this.loggingService.log('GET /system/dict/data/:id', {
  //     params: { id },
  //   });
  //   const dictData = await this.dictService.getData(id);
  //   this.loggingService.log('GET /system/dict/data/:id success');
  //   return {
  //     code: 200,
  //     msg: '字典数据获取成功',
  //     data: toFrontendDictDataDto(dictData),
  //   };
  // }

  // @Get('data/type/:dictType')
  // async getDataByType(@Param('dictType') dictType: string) {
  //   this.loggingService.log('GET /system/dict/data/type/:dictType', {
  //     params: { dictType },
  //   });
  //   const data = await this.dictService.getDataByType(dictType);
  //   this.loggingService.log('GET /system/dict/data/type/:dictType success', {
  //     responseDescriptor: { type: 'list', count: data.length },
  //   });
  //   return {
  //     code: 200,
  //     msg: '字典数据获取成功',
  //     data: toFrontendDictDataDtos(data),
  //   };
  // }

  // 已更新
  @RequirePerms('system:dict:add')
  @Post('data/create')
  async createData(@Body() dto: CreateDictDataDto) {
    this.loggingService.log('POST /system/dict/data/create', {
      requestDescriptor: { data: dto },
    });
    await this.dictService.createData(dto);
    this.loggingService.log('POST /system/dict/data/create success');
    return { code: 200, msg: '字典数据创建成功', data: null };
  }

  // 已更新
  @RequirePerms('system:dict:edit')
  @Post('data/update')
  async updateData(@Body() dto: UpdateDictDataDto) {
    this.loggingService.log('POST /system/dict/data/update', {
      requestDescriptor: { data: dto },
    });
    await this.dictService.updateData(dto);
    this.loggingService.log('POST /system/dict/data/update success');
    return { code: 200, msg: '字典数据更新成功', data: null };
  }

  // 已更新
  @RequirePerms('system:dict:remove')
  @Delete('data/delete/:id')
  async deleteData(@Param('id') id: string) {
    this.loggingService.log('DELETE /system/dict/data/delete/:id', {
      params: { id },
    });
    await this.dictService.deleteData(id);
    this.loggingService.log('DELETE /system/dict/data/delete/:id success');
    return { code: 200, msg: '字典数据删除成功', data: null };
  }
}
