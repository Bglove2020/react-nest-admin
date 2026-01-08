import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import { DictService } from './dict.service';
import { SysDict } from './entities/dict.entity';
import { SysDictData } from './entities/dict-data.entity';
import { RedisService } from '@/common/redis/redis.service';

describe('DictService', () => {
  let service: DictService;
  let dictRepository: jest.Mocked<Repository<SysDict>>;
  let dictDataRepository: jest.Mocked<Repository<SysDictData>>;
  let redisService: jest.Mocked<RedisService>;

  const mockDict = {
    id: 'dict-1',
    name: 'Test Dict',
    type: 'test_type',
    status: '1',
    sortOrder: 1,
    dictData: [],
  };

  const mockDictData = {
    id: 'data-1',
    label: 'Test Label',
    value: 'test_value',
    sortOrder: 1,
    status: '1',
    dict: mockDict,
  };

  const mockRepository = () => ({
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DictService,
        {
          provide: getRepositoryToken(SysDict),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SysDictData),
          useFactory: mockRepository,
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DictService>(DictService);
    dictRepository = module.get(getRepositoryToken(SysDict));
    dictDataRepository = module.get(getRepositoryToken(SysDictData));
    redisService = module.get(RedisService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated dict list', async () => {
      const dictListDto = {
        pageNum: 0,
        pageSize: 10,
      };

      dictRepository.findAndCount.mockResolvedValue([[mockDict], 1]);

      const result = await service.list(dictListDto);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return all dicts when pagination is not provided', async () => {
      const dictListDto = {};

      dictRepository.find.mockResolvedValue([mockDict]);

      const result = await service.list(dictListDto);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply name filter', async () => {
      const dictListDto = {
        pageNum: 0,
        pageSize: 10,
        name: 'Test',
      };

      dictRepository.findAndCount.mockResolvedValue([[mockDict], 1]);

      await service.list(dictListDto);

      const callArgs = dictRepository.findAndCount.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('name');
    });

    it('should apply type filter', async () => {
      const dictListDto = {
        pageNum: 0,
        pageSize: 10,
        type: 'test',
      };

      dictRepository.findAndCount.mockResolvedValue([[mockDict], 1]);

      await service.list(dictListDto);

      const callArgs = dictRepository.findAndCount.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('type');
    });

    it('should apply status filter', async () => {
      const dictListDto = {
        pageNum: 0,
        pageSize: 10,
        status: '1',
      };

      dictRepository.findAndCount.mockResolvedValue([[mockDict], 1]);

      await service.list(dictListDto);

      expect(dictRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { status: '1' },
        order: expect.anything(),
      });
    });

    it('should throw BadRequestException on database error', async () => {
      const dictListDto = {
        pageNum: 0,
        pageSize: 10,
      };

      dictRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(service.list(dictListDto)).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('dataList', () => {
    it('should return paginated dict data list', async () => {
      const dictDataListDto = {
        pageNum: 0,
        pageSize: 10,
      };

      dictDataRepository.findAndCount.mockResolvedValue([[mockDictData], 1]);

      const result = await service.dataList(dictDataListDto, 'test_type');

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(dictDataRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { dict: { type: 'test_type' } },
        order: expect.anything(),
        relations: { dict: true },
      });
    });

    it('should apply label filter', async () => {
      const dictDataListDto = {
        pageNum: 0,
        pageSize: 10,
        label: 'Test',
      };

      dictDataRepository.findAndCount.mockResolvedValue([[mockDictData], 1]);

      await service.dataList(dictDataListDto, 'test_type');

      const callArgs = dictDataRepository.findAndCount.mock.calls[0][0];
      expect(callArgs.where.label).toBeDefined();
    });

    it('should throw BadRequestException on database error', async () => {
      const dictDataListDto = {
        pageNum: 0,
        pageSize: 10,
      };

      dictDataRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(service.dataList(dictDataListDto, 'test_type')).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('get', () => {
    it('should return dict by id', async () => {
      dictRepository.findOne.mockResolvedValue(mockDict as any);

      const result = await service.get('dict-1');

      expect(result).toEqual(mockDict);
      expect(dictRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'dict-1' },
        relations: { dictData: true },
      });
    });

    it('should throw BadRequestException if dict not found', async () => {
      dictRepository.findOne.mockResolvedValue(null);

      await expect(service.get('nonexistent')).rejects.toThrow(
        new BadRequestException({ msg: '字典类型不存�?, code: 400 }),
      );
    });
  });

  describe('getByType', () => {
    it('should return dict by type', async () => {
      dictRepository.findOne.mockResolvedValue(mockDict as any);

      const result = await service.getByType('test_type');

      expect(result).toEqual(mockDict);
      expect(dictRepository.findOne).toHaveBeenCalledWith({
        where: { type: 'test_type', status: '1' },
      });
    });

    it('should throw BadRequestException if dict not found', async () => {
      dictRepository.findOne.mockResolvedValue(null);

      await expect(service.getByType('nonexistent')).rejects.toThrow(
        new BadRequestException({ msg: '字典类型不存�?, code: 400 }),
      );
    });

    it('should throw error on database error', async () => {
      dictRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getByType('test_type')).rejects.toThrow(Error);
    });
  });

  describe('create', () => {
    it('should create dict', async () => {
      const createDictDto = {
        name: 'New Dict',
        type: 'new_type',
        status: '1',
        sortOrder: 1,
      };

      dictRepository.create.mockReturnValue(mockDict as any);
      dictRepository.save.mockResolvedValue(mockDict as any);

      await service.create(createDictDto);

      expect(dictRepository.create).toHaveBeenCalledWith(createDictDto);
      expect(dictRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException on database error', async () => {
      const createDictDto = {
        name: 'New Dict',
        type: 'new_type',
      };

      dictRepository.create.mockReturnValue(mockDict as any);
      dictRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDictDto)).rejects.toThrow(
        new BadRequestException({ msg: '数据库保存错�?, code: 400 }),
      );
    });
  });

  describe('update', () => {
    it('should update dict', async () => {
      const updateDictDto = {
        id: 'dict-1',
        name: 'Updated Dict',
        type: 'test_type',
      };

      dictRepository.findOne.mockResolvedValue(mockDict as any);
      dictRepository.save.mockResolvedValue({ ...mockDict, name: 'Updated Dict' } as any);
      redisService.del.mockResolvedValue(undefined);

      await service.update(updateDictDto);

      expect(dictRepository.save).toHaveBeenCalled();
    });

    it('should delete old type cache when type changes', async () => {
      const updateDictDto = {
        id: 'dict-1',
        name: 'Updated Dict',
        type: 'new_type',
      };

      dictRepository.findOne.mockResolvedValue(mockDict as any);
      dictRepository.save.mockResolvedValue({ ...mockDict, type: 'new_type' } as any);
      redisService.del.mockResolvedValue(undefined);

      await service.update(updateDictDto);

      expect(redisService.del).toHaveBeenCalledWith('dict:data:test_type');
      expect(redisService.del).toHaveBeenCalledWith('dict:data:new_type');
    });

    it('should throw BadRequestException with code 409 on optimistic lock error', async () => {
      const updateDictDto = {
        id: 'dict-1',
        name: 'Updated Dict',
      };

      const lockError = new Error('Lock error') as OptimisticLockVersionMismatchError;
      lockError.name = 'OptimisticLockVersionMismatchError';

      dictRepository.findOne.mockResolvedValue(mockDict as any);
      dictRepository.save.mockRejectedValue(lockError);

      await expect(service.update(updateDictDto)).rejects.toThrow(
        new BadRequestException({
          msg: '数据已被他人修改，请刷新后重�?,
          code: 409,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete dict', async () => {
      dictRepository.findOne.mockResolvedValue(mockDict as any);
      dictRepository.softRemove.mockResolvedValue(mockDict as any);
      redisService.del.mockResolvedValue(undefined);

      await service.delete('dict-1');

      expect(dictRepository.softRemove).toHaveBeenCalledWith(mockDict);
      expect(redisService.del).toHaveBeenCalledWith('dict:data:test_type');
    });

    it('should throw BadRequestException if dict has data', async () => {
      const dictWithData = {
        ...mockDict,
        dictData: [{ id: 'data-1' }, { id: 'data-2' }],
      };

      dictRepository.findOne.mockResolvedValue(dictWithData as any);

      await expect(service.delete('dict-1')).rejects.toThrow(
        new BadRequestException({ msg: '该字典下存在字典数据，无法删�?, code: 400 }),
      );
    });
  });

  describe('createData', () => {
    it('should create dict data', async () => {
      const createDictDataDto = {
        type: 'test_type',
        label: 'New Label',
        value: 'new_value',
        sortOrder: 1,
        status: '1',
      };

      dictRepository.findOne.mockResolvedValue(mockDict as any);
      dictDataRepository.create.mockReturnValue(mockDictData as any);
      dictDataRepository.save.mockResolvedValue(mockDictData as any);
      redisService.del.mockResolvedValue(undefined);

      await service.createData(createDictDataDto);

      expect(dictRepository.findOne).toHaveBeenCalledWith({
        where: { type: 'test_type' },
      });
      expect(dictDataRepository.create).toHaveBeenCalled();
      expect(redisService.del).toHaveBeenCalledWith('dict:data:test_type');
    });

    it('should throw BadRequestException if dict not found', async () => {
      const createDictDataDto = {
        type: 'nonexistent',
        label: 'New Label',
        value: 'new_value',
      };

      dictRepository.findOne.mockResolvedValue(null);

      await expect(service.createData(createDictDataDto)).rejects.toThrow(
        new BadRequestException({ msg: '字典不存�?, code: 400 }),
      );
    });
  });

  describe('updateData', () => {
    it('should update dict data', async () => {
      const updateDictDataDto = {
        id: 'data-1',
        label: 'Updated Label',
      };

      dictDataRepository.findOne.mockResolvedValue(mockDictData as any);
      dictDataRepository.save.mockResolvedValue({ ...mockDictData, label: 'Updated Label' } as any);
      redisService.del.mockResolvedValue(undefined);

      await service.updateData(updateDictDataDto);

      expect(dictDataRepository.save).toHaveBeenCalled();
      expect(redisService.del).toHaveBeenCalledWith('dict:data:test_type');
    });

    it('should throw BadRequestException if dict data not found', async () => {
      const updateDictDataDto = {
        id: 'nonexistent',
        label: 'Updated Label',
      };

      dictDataRepository.findOne.mockResolvedValue(null);

      await expect(service.updateData(updateDictDataDto)).rejects.toThrow(
        new BadRequestException({ msg: '字典数据不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException with code 409 on optimistic lock error', async () => {
      const updateDictDataDto = {
        id: 'data-1',
        label: 'Updated Label',
      };

      const lockError = new Error('Lock error') as OptimisticLockVersionMismatchError;
      lockError.name = 'OptimisticLockVersionMismatchError';

      dictDataRepository.findOne.mockResolvedValue(mockDictData as any);
      dictDataRepository.save.mockRejectedValue(lockError);

      await expect(service.updateData(updateDictDataDto)).rejects.toThrow(
        new BadRequestException({
          msg: '数据已被他人修改，请刷新后重�?,
          code: 409,
        }),
      );
    });
  });

  describe('deleteData', () => {
    it('should delete dict data', async () => {
      dictDataRepository.findOne.mockResolvedValue(mockDictData as any);
      dictDataRepository.softRemove.mockResolvedValue(mockDictData as any);
      redisService.del.mockResolvedValue(undefined);

      await service.deleteData('data-1');

      expect(dictDataRepository.softRemove).toHaveBeenCalledWith(mockDictData);
      expect(redisService.del).toHaveBeenCalledWith('dict:data:test_type');
    });

    it('should throw BadRequestException if dict data not found', async () => {
      dictDataRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteData('nonexistent')).rejects.toThrow(
        new BadRequestException({ msg: '字典数据不存在或已删�?, code: 400 }),
      );
    });
  });
});
