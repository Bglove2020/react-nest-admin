import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import { DeptService } from './dept.service';
import { SysDept } from './entities/dept.entity';
import { SysUser } from '../user/entities/user.entity';
import { RedisService } from '@/common/redis/redis.service';
import { AlsService } from '@/common/als/als.service';

describe('DeptService', () => {

  let service: DeptService;
  let deptRepository: jest.Mocked<Repository<SysDept>>;
  let userRepository: jest.Mocked<Repository<SysUser>>;
  let redisService: jest.Mocked<RedisService>;
  let alsService: jest.Mocked<AlsService>;

  const mockLeader = {
    id: 'user-1',
    name: 'Leader User',
    account: 'leader',
  };

  const mockParentDept = {
    id: 'dept-1',
    name: 'Parent Department',
    parentId: '0',
  };

  const mockDept = {
    id: 'dept-2',
    name: 'Test Department',
    parentId: 'dept-1',
    leader: mockLeader,
    sortOrder: 1,
    status: '1',
  };

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    findByIds: jest.fn(),
    query: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeptService,
        {
          provide: getRepositoryToken(SysDept),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SysUser),
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
        {
          provide: AlsService,
          useValue: {
            getUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeptService>(DeptService);
    deptRepository = module.get(getRepositoryToken(SysDept));
    userRepository = module.get(getRepositoryToken(SysUser));
    redisService = module.get(RedisService);
    alsService = module.get(AlsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create top level department without parentId', async () => {
      const createDeptDto = {
        name: 'New Department',
        sortOrder: 1,
        status: '1',
      };
      deptRepository.create.mockReturnValue(mockDept as any);
      deptRepository.save.mockResolvedValue(mockDept as any);

      await service.create(createDeptDto);
      expect(deptRepository.create).toHaveBeenCalledWith({
        name: 'New Department',
        parentId: '0',
        leader: null,
        sortOrder: 1,
        status: '1',
      });
      expect(deptRepository.save).toHaveBeenCalled();
    });

    it('should create department with parent', async () => {
      const createDeptDto = {
        name: 'New Department',
        parentId: 'dept-1',
        sortOrder: 1,
        status: '1',
      };

      deptRepository.findOne.mockResolvedValue(mockParentDept as any);
      deptRepository.create.mockReturnValue(mockDept as any);
      deptRepository.save.mockResolvedValue(mockDept as any);

      await service.create(createDeptDto);

      expect(deptRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
      });
      expect(deptRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: 'dept-1',
        }),
      );
    });

    it('should create department with leader', async () => {
      const createDeptDto = {
        name: 'New Department',
        leaderId: 'user-1',
        sortOrder: 1,
        status: '1',
      };

      userRepository.findOne.mockResolvedValue(mockLeader as any);
      deptRepository.create.mockReturnValue(mockDept as any);
      deptRepository.save.mockResolvedValue(mockDept as any);

      await service.create(createDeptDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(deptRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          leader: mockLeader,
        }),
      );
    });

    it('should throw BadRequestException if parent dept not found', async () => {
      const createDeptDto = {
        name: 'New Department',
        parentId: 'nonexistent',
        sortOrder: 1,
        status: '1',
      };

      deptRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDeptDto)).rejects.toThrow(
        new BadRequestException({ msg: '父部门不存在', code: 400 }),
      );
    });

    it('should throw BadRequestException if leader not found', async () => {
      const createDeptDto = {
        name: 'New Department',
        leaderId: 'nonexistent',
        sortOrder: 1,
        status: '1',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDeptDto)).rejects.toThrow(
        new BadRequestException({ msg: '负责人不存在', code: 400 }),
      );
    });
  });

  describe('list', () => {
    it('should return department list', async () => {
      const depts = [mockParentDept, mockDept];
      deptRepository.find.mockResolvedValue(depts as any);

      const result = await service.list();

      expect(deptRepository.find).toHaveBeenCalledWith({
        relations: { leader: true },
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw BadRequestException on database error', async () => {
      deptRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.list()).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('update', () => {
    it('should update department name', async () => {
      const updateDeptDto = {
        id: 'dept-2',
        name: 'Updated Department',
      };

      deptRepository.findOne.mockResolvedValue(mockDept as any);
      deptRepository.save.mockResolvedValue({ ...mockDept, name: 'Updated Department' } as any);

      await service.update(updateDeptDto);

      expect(deptRepository.save).toHaveBeenCalled();
    });

    it('should update department leader', async () => {
      const updateDeptDto = {
        id: 'dept-2',
        leaderId: 'user-2',
      };

      const newLeader = { id: 'user-2', name: 'New Leader' };
      const updatedDept = { ...mockDept, leader: newLeader };

      deptRepository.findOne.mockResolvedValue(mockDept as any);
      userRepository.findOne.mockResolvedValue(newLeader as any);
      deptRepository.save.mockResolvedValue(updatedDept as any);

      await service.update(updateDeptDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-2' },
      });
    });

    it('should throw BadRequestException when trying to update parentId', async () => {
      const updateDeptDto = {
        id: 'dept-2',
        parentId: 'dept-3',
      };

      deptRepository.findOne.mockResolvedValue(mockDept as any);

      await expect(service.update(updateDeptDto)).rejects.toThrow(
        new BadRequestException({ msg: '不允许更新父部门', code: 400 }),
      );
    });

    it('should throw BadRequestException if dept not found', async () => {
      const updateDeptDto = {
        id: 'nonexistent',
        name: 'Updated Name',
      };

      deptRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateDeptDto)).rejects.toThrow(
        new BadRequestException({ msg: '部门不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException with code 409 on optimistic lock error', async () => {
      const updateDeptDto = {
        id: 'dept-2',
        name: 'Updated Name',
      };

      const lockError = new Error('Lock error') as OptimisticLockVersionMismatchError;
      lockError.name = 'OptimisticLockVersionMismatchError';

      deptRepository.findOne.mockResolvedValue(mockDept as any);
      deptRepository.save.mockRejectedValue(lockError);

      await expect(service.update(updateDeptDto)).rejects.toThrow(
        new BadRequestException({
          msg: '数据已被他人修改，请刷新后重�?,
          code: 409,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete department and return counts', async () => {
      deptRepository.findOne.mockResolvedValue(mockDept as any);
      deptRepository.query.mockResolvedValue([{ id: 'child-1' }, { id: 'child-2' }]);
      deptRepository.findByIds.mockResolvedValue([mockDept] as any);
      deptRepository.softRemove.mockResolvedValue(mockDept as any);
      userRepository.softRemove.mockResolvedValue([] as any);

      const result = await service.delete('dept-2');

      expect(result).toHaveProperty('childCount');
      expect(result).toHaveProperty('userCount');
    });

    it('should throw BadRequestException if dept not found', async () => {
      deptRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        new BadRequestException({ msg: '部门不存在或已删�?, code: 400 }),
      );
    });

    it('should throw BadRequestException on query error', async () => {
      deptRepository.findOne.mockResolvedValue(mockDept as any);
      deptRepository.query.mockRejectedValue(new Error('Query error'));

      await expect(service.delete('dept-2')).rejects.toThrow(
        new BadRequestException({ msg: '查询子部门失�?, code: 400 }),
      );
    });
  });
});
