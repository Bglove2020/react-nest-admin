import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { SysDict } from './entities/dict.entity';
import { SysDictData } from './entities/dict-data.entity';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';
import { DictListDto } from './dto/dict-list.dto';
import { DictDataListDto } from './dto/dict-data-list.dto';
import { RedisService } from '@/common/redis/redis.service';
import { removeUndefined } from '@/common/utils/remove-undefined.util';

const DICT_DATA_CACHE_KEY_PREFIX = 'dict:data:';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(SysDict)
    private readonly dictRepository: Repository<SysDict>,
    @InjectRepository(SysDictData)
    private readonly dictDataRepository: Repository<SysDictData>,
    private readonly redisService: RedisService,
  ) {}

  // 已更新
  async list(dictListDto: DictListDto): Promise<{
    list: SysDict[];
    total: number;
  }> {
    try {
      const { pageNum, pageSize, name, type, status, sortField, sortOrder } = dictListDto;

      // 构建查询条件
      const where = this.buildWhereCondition({ name, type, status });

      // 构建排序条件
      let order: Record<string, 'ASC' | 'DESC'> = { sortOrder: 'ASC', createTime: 'DESC' };
      const validSortFields = ['name', 'type', 'sortOrder', 'createTime'];
      if (sortField && validSortFields.includes(sortField)) {
        order = { [sortField]: sortOrder === 'asc' ? 'ASC' : 'DESC' };
      }

      // 判断是否分页
      const isPaginated = pageNum !== undefined && pageSize !== undefined;

      // 执行查询
      if (isPaginated) {
        // 分页查询
        const [list, total] = await this.dictRepository.findAndCount({
          skip: pageNum * pageSize,
          take: pageSize,
          where,
          order,
        });
        return { list, total };
      } else {
        // 查询全部
        const list = await this.dictRepository.find({
          where,
          order,
        });
        return { list, total: list.length };
      }
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
  }

  private buildWhereCondition(filters: {
    name?: string;
    type?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.name) {
      where.name = Like(`%${filters.name}%`);
    }

    if (filters.type) {
      where.type = Like(`%${filters.type}%`);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }

  // 已更新
  async dataList(
    dictDataListDto: DictDataListDto,
    type: string,
  ): Promise<{
    list: SysDictData[];
    total: number;
  }> {
    // 如果有类型过滤，不需要缓存（因为分页参数多变）
    try {
      const { pageNum, pageSize, label, status, sortField, sortOrder } = dictDataListDto;

      // 构建查询条件
      const where: any = { dict: { type } };

      if (label) {
        where.label = Like(`%${label}%`);
      }

      if (status) {
        where.status = status;
      }

      // 构建排序条件
      let order: Record<string, 'ASC' | 'DESC'> = { sortOrder: 'ASC' };
      const validSortFields = ['label', 'sortOrder', 'createTime'];
      if (sortField && validSortFields.includes(sortField)) {
        order = { [sortField]: sortOrder === 'asc' ? 'ASC' : 'DESC' };
      }

      // 判断是否分页
      const isPaginated = pageNum !== undefined && pageSize !== undefined;

      // 执行查询
      if (isPaginated) {
        // 分页查询
        const [list, total] = await this.dictDataRepository.findAndCount({
          skip: pageNum * pageSize,
          take: pageSize,
          where,
          order,
          relations: { dict: true },
        });
        return { list, total };
      } else {
        // 查询全部
        const list = await this.dictDataRepository.find({
          where,
          order,
          relations: { dict: true },
        });
        return { list, total: list.length };
      }
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
  }

  // 已更新
  async get(id: string): Promise<SysDict> {
    let dict: SysDict | null = null;
    try {
      dict = await this.dictRepository.findOne({
        where: { id },
        relations: { dictData: true },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!dict) {
      throw new BadRequestException({ msg: '字典类型不存在', code: 400 });
    }
    return dict;
  }

  // 已更新
  async getByType(type: string): Promise<SysDict> {
    let dict: SysDict | null = null;
    try {
      dict = await this.dictRepository.findOne({
        where: { type: type, status: '1' },
      });
    } catch (e: any) {
      throw new Error(e);
      // throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!dict) {
      throw new BadRequestException({ msg: '字典类型不存在', code: 400 });
    }
    return dict;
  }

  // 已更新
  async create(dto: CreateDictTypeDto): Promise<void> {
    const entity = this.dictRepository.create(dto);
    try {
      await this.dictRepository.save(entity);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库保存错误', code: 400 });
    }
  }

  // 已更新
  async update(dto: UpdateDictTypeDto): Promise<void> {
    const dict = await this.get(dto.id);
    const oldType = dict.type;

    try {
      await this.dictRepository.save({ ...dict, ...removeUndefined(dto) });
      if (oldType !== dto.type && dto.type) {
        await this.redisService.del(`${DICT_DATA_CACHE_KEY_PREFIX}${oldType}`);
      }
      if (dto.type) {
        await this.redisService.del(`${DICT_DATA_CACHE_KEY_PREFIX}${dto.type}`);
      }
    } catch (e: any) {
      if (e instanceof OptimisticLockVersionMismatchError) {
        throw new BadRequestException({
          msg: '数据已被他人修改，请刷新后重试',
          code: 409,
        });
      }
      throw new BadRequestException({ msg: '数据库更新错误', code: 400 });
    }
  }

  // 已更新
  async delete(id: string): Promise<void> {
    const dict = await this.get(id);
    if (!dict) {
      throw new BadRequestException({ msg: '字典不存在', code: 400 });
    }
    if (dict.dictData.length > 0) {
      throw new BadRequestException({
        msg: '该字典下存在字典数据，无法删除',
        code: 400,
      });
    }
    try {
      await this.dictRepository.softRemove(dict);
      await this.redisService.del(`${DICT_DATA_CACHE_KEY_PREFIX}${dict.type}`);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库删除错误', code: 400 });
    }
  }

  // 已更新。创建时需要传入dictType
  async createData(dto: CreateDictDataDto): Promise<void> {
    let dict: SysDict | null = null;
    try {
      dict = await this.dictRepository.findOne({
        where: { type: dto.type },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!dict) {
      throw new BadRequestException({ msg: '字典不存在', code: 400 });
    }

    const dictData = this.dictDataRepository.create({
      label: dto.label,
      value: dto.value,
      sortOrder: dto.sortOrder,
      status: dto.status,
      createBy: 'system',
      updateBy: 'system',
      dict: dict,
    });

    try {
      await this.dictDataRepository.save(dictData);
      await this.redisService.del(`${DICT_DATA_CACHE_KEY_PREFIX}${dto.type}`);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库保存错误', code: 400 });
    }
  }

  // 已更新。更新字典数据时要传id
  async updateData(dto: UpdateDictDataDto): Promise<void> {
    const dictData = await this.dictDataRepository.findOne({
      where: { id: dto.id },
      relations: { dict: true },
    });
    if (!dictData) {
      throw new BadRequestException({ msg: '字典数据不存在', code: 400 });
    }

    try {
      await this.dictDataRepository.save({
        ...dictData,
        ...removeUndefined(dto),
      });
      if (dictData.dict) {
        await this.redisService.del(
          `${DICT_DATA_CACHE_KEY_PREFIX}${dictData.dict.type}`,
        );
      }
    } catch (e: any) {
      if (e instanceof OptimisticLockVersionMismatchError) {
        throw new BadRequestException({
          msg: '数据已被他人修改，请刷新后重试',
          code: 409,
        });
      }
      throw new BadRequestException({ msg: '数据库更新错误', code: 400 });
    }
  }

  async deleteData(id: string): Promise<void> {
    let dictData: SysDictData | null = null;
    try {
      dictData = await this.dictDataRepository.findOne({
        where: { id },
        relations: { dict: true },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!dictData) {
      throw new BadRequestException({
        msg: '字典数据不存在或已删除',
        code: 400,
      });
    }
    try {
      await this.dictDataRepository.softRemove(dictData);
      if (dictData.dict) {
        await this.redisService.del(
          `${DICT_DATA_CACHE_KEY_PREFIX}${dictData.dict.type}`,
        );
      }
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库删除错误', code: 400 });
    }
  }

  // async getDataByType(dictType: string): Promise<SysDictData[]> {
  //   try {
  //     return await this.dictDataRepository.find({
  //       where: { dictType },
  //       relations: { dictType: true },
  //       order: { dictSort: 'ASC' },
  //     });
  //   } catch (e: any) {
  //     throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
  //   }
  // }
}
