import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import { UserService } from './user.service';
import { SysUser } from './entities/user.entity';
import { SysDept } from '../dept/entities/dept.entity';
import { SysRole } from '../role/entities/role.entity';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/common/redis/redis.service';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {

  let service: UserService;
  let userRepository: jest.Mocked<Repository<SysUser>>;
  let deptRepository: jest.Mocked<Repository<SysDept>>;
  let roleRepository: jest.Mocked<Repository<SysRole>>;
  let redisService: jest.Mocked<RedisService>;

  const mockDept = {
    id: 'dept-1',
    name: 'Test Department',
  };

  const mockRole = {
    id: 'role-1',
    roleKey: 'user',
    name: 'User',
  };

  const mockUser = {
    id: 'user-1',
    account: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    sex: '1',
    status: '1',
    dept: mockDept,
    roles: [mockRole],
    leaderDepts: [],
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
        UserService,
        {
          provide: getRepositoryToken(SysUser),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SysDept),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SysRole),
          useFactory: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            del: jest.fn(),
            delByPattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(SysUser));
    deptRepository = module.get(getRepositoryToken(SysDept));
    roleRepository = module.get(getRepositoryToken(SysRole));
    redisService = module.get(RedisService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated user list', async () => {
      const userListDto = {
        pageNum: 0,
        pageSize: 10,
      };

      userRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.list(userListDto);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return all users when pagination is not provided', async () => {
      const userListDto = {};

      userRepository.find.mockResolvedValue([mockUser]);

      const result = await service.list(userListDto);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply account filter', async () => {
      const userListDto = {
        pageNum: 0,
        pageSize: 10,
        account: 'test',
      };

      userRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.list(userListDto);

      const callArgs = userRepository.findAndCount.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('account');
    });

    it('should apply sex filter', async () => {
      const userListDto = {
        pageNum: 0,
        pageSize: 10,
        sex: '1',
      };

      userRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.list(userListDto);

      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { sex: '1' },
        order: { createTime: 'DESC' },
        relations: { dept: true, roles: true },
      });
    });

    it('should apply status filter', async () => {
      const userListDto = {
        pageNum: 0,
        pageSize: 10,
        status: ['1', '2'],
      };

      userRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.list(userListDto);

      const callArgs = userRepository.findAndCount.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('status');
    });

    it('should apply custom sort', async () => {
      const userListDto = {
        pageNum: 0,
        pageSize: 10,
        sortField: 'account',
        sortOrder: 'asc' as const,
      };

      userRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.list(userListDto);

      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        order: { account: 'ASC' },
        relations: { dept: true, roles: true },
      });
    });

    it('should throw BadRequestException on database error', async () => {
      const userListDto = {
        pageNum: 0,
        pageSize: 10,
      };

      userRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(service.list(userListDto)).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('get', () => {
    it('should return user with relations', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as any);

      const result = await service.get('user-1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: { dept: true, roles: true },
      });
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw BadRequestException on database error', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.get('user-1')).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('getByAccount', () => {
    it('should return user by account', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as any);

      const result = await service.getByAccount('testuser');

      expect(result).toEqual(mockUser);
    });

    it('should return null if account not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.getByAccount('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user with dept and roles', async () => {
      const createUserDto = {
        account: 'newuser',
        password: 'password123',
        name: 'New User',
        email: 'new@example.com',
        sex: '1',
        deptId: 'dept-1',
        roleIds: ['role-1'],
        status: '1',
      };

      deptRepository.findOne.mockResolvedValue(mockDept as any);
      roleRepository.find.mockResolvedValue([mockRole] as any);
      userRepository.create.mockReturnValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should use first dept if deptId not provided', async () => {
      const createUserDto = {
        account: 'newuser',
        password: 'password123',
        name: 'New User',
        email: 'new@example.com',
      };

      deptRepository.find.mockResolvedValue([mockDept] as any);
      roleRepository.findOne.mockResolvedValue(mockRole as any);
      userRepository.create.mockReturnValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      await service.create(createUserDto);

      expect(deptRepository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' },
        take: 1,
      });
    });

    it('should throw BadRequestException if dept not found', async () => {
      const createUserDto = {
        account: 'newuser',
        password: 'password123',
        name: 'New User',
        deptId: 'nonexistent',
      };

      deptRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException({ msg: '部门不存�?, code: 400 }),
      );
    });

    it('should use default role if roleIds not provided', async () => {
      const registerDto = {
        account: 'newuser',
        password: 'password123',
        name: 'New User',
        email: 'new@example.com',
      };

      deptRepository.find.mockResolvedValue([mockDept] as any);
      roleRepository.findOne.mockResolvedValue(mockRole as any);
      userRepository.create.mockReturnValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      await service.create(registerDto);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { roleKey: 'user' },
      });
    });

    it('should throw BadRequestException if default role not found', async () => {
      const registerDto = {
        account: 'newuser',
        password: 'password123',
        name: 'New User',
      };

      deptRepository.find.mockResolvedValue([mockDept] as any);
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.create(registerDto)).rejects.toThrow(
        new BadRequestException({
          msg: '默认用户角色不存在，请先运行数据库初始化',
          code: 400,
        }),
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const resetPasswordDto = {
        id: 'user-1',
        password: 'newpassword',
      };

      userRepository.findOne.mockResolvedValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newhashed' as never);
      redisService.del.mockResolvedValue(undefined);

      await service.resetPassword(resetPasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(userRepository.save).toHaveBeenCalled();
      expect(redisService.del).toHaveBeenCalledWith(
        'user-info-roles-permissions:user-1',
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      const resetPasswordDto = {
        id: 'nonexistent',
        password: 'newpassword',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        new BadRequestException({ msg: '用户不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException with code 409 on optimistic lock error', async () => {
      const resetPasswordDto = {
        id: 'user-1',
        password: 'newpassword',
      };

      const lockError = new Error('Lock error') as OptimisticLockVersionMismatchError;
      lockError.name = 'OptimisticLockVersionMismatchError';

      userRepository.findOne.mockResolvedValue(mockUser as any);
      userRepository.save.mockRejectedValue(lockError);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newhashed' as never);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        new BadRequestException({
          msg: '数据已被他人修改，请刷新后重�?,
          code: 409,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as any);
      userRepository.softRemove.mockResolvedValue(mockUser as any);
      redisService.del.mockResolvedValue(undefined);

      await service.delete('user-1');

      expect(userRepository.softRemove).toHaveBeenCalledWith(mockUser);
      expect(redisService.del).toHaveBeenCalledWith(
        'user-info-roles-permissions:user-1',
      );
      expect(redisService.del).toHaveBeenCalledWith('menu:list:user-1');
    });

    it('should throw BadRequestException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        new BadRequestException({ msg: '用户不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException if user is department leader', async () => {
      const leaderUser = {
        ...mockUser,
        leaderDepts: [{ id: 'dept-1' }],
      };

      userRepository.findOne.mockResolvedValue(leaderUser as any);

      await expect(service.delete('user-1')).rejects.toThrow(
        new BadRequestException({ msg: '用户是院系负责人，不能删�?, code: 400 }),
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateUserDto = {
        id: 'user-1',
        name: 'Updated Name',
      };

      userRepository.findOne.mockResolvedValue(mockUser as any);
      userRepository.save.mockResolvedValue(mockUser as any);
      redisService.del.mockResolvedValue(undefined);

      await service.update(updateUserDto);

      expect(userRepository.save).toHaveBeenCalled();
      expect(redisService.del).toHaveBeenCalledWith(
        'user-info-roles-permissions:user-1',
      );
    });

    it('should update user dept', async () => {
      const updateUserDto = {
        id: 'user-1',
        name: 'Updated Name',
        deptId: 'dept-2',
      };

      const newDept = { id: 'dept-2', name: 'New Dept' };

      userRepository.findOne.mockResolvedValue(mockUser as any);
      deptRepository.findOne.mockResolvedValue(newDept as any);
      userRepository.save.mockResolvedValue({ ...mockUser, dept: newDept } as any);
      redisService.del.mockResolvedValue(undefined);

      await service.update(updateUserDto);

      expect(deptRepository.findOne).toHaveBeenCalledWith({ where: { id: 'dept-2' } });
    });

    it('should update user roles', async () => {
      const updateUserDto = {
        id: 'user-1',
        roleIds: ['role-2'],
      };

      const newRole = { id: 'role-2', roleKey: 'admin', name: 'Admin' };

      userRepository.findOne.mockResolvedValue(mockUser as any);
      roleRepository.find.mockResolvedValue([newRole] as any);
      userRepository.save.mockResolvedValue({ ...mockUser, roles: [newRole] } as any);
      redisService.del.mockResolvedValue(undefined);

      await service.update(updateUserDto);

      expect(roleRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: expect.anything(),
          }),
        }),
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      const updateUserDto = {
        id: 'nonexistent',
        name: 'Updated Name',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateUserDto)).rejects.toThrow(
        new BadRequestException({ msg: '用户不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException if new dept not found', async () => {
      const updateUserDto = {
        id: 'user-1',
        deptId: 'nonexistent',
      };

      userRepository.findOne.mockResolvedValue(mockUser as any);
      deptRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateUserDto)).rejects.toThrow(
        new BadRequestException({ msg: '部门不存�?, code: 400 }),
      );
    });
  });
});
