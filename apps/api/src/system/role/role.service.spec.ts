import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import { RoleService } from './role.service';
import { SysRole } from './entities/role.entity';
import { SysMenu } from '../menu/entities/menu.entity';
import { SysUser } from '../user/entities/user.entity';
import { RedisService } from '@/common/redis/redis.service';

describe('RoleService', () => {

  let service: RoleService;
  let roleRepository: jest.Mocked<Repository<SysRole>>;
  let menuRepository: jest.Mocked<Repository<SysMenu>>;
  let userRepository: jest.Mocked<Repository<SysUser>>;
  let redisService: jest.Mocked<RedisService>;

  const mockMenu = {
    id: 'menu-1',
    name: 'Test Menu',
    path: '/test',
  };

  const mockRole = {
    id: 'role-1',
    name: 'Admin',
    roleKey: 'admin',
    sortOrder: 1,
    dataScope: '1',
    status: '1',
    remark: 'Admin role',
    menus: [mockMenu],
    users: [],
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
        RoleService,
        {
          provide: getRepositoryToken(SysRole),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SysMenu),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SysUser),
          useFactory: mockRepository,
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

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get(getRepositoryToken(SysRole));
    menuRepository = module.get(getRepositoryToken(SysMenu));
    userRepository = module.get(getRepositoryToken(SysUser));
    redisService = module.get(RedisService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create role without menus', async () => {
      const createRoleDto = {
        name: 'New Role',
        roleKey: 'newrole',
        sortOrder: 1,
        dataScope: '1',
        status: '1',
      };
      roleRepository.create.mockReturnValue(mockRole as any);
      roleRepository.save.mockResolvedValue(mockRole as any);
      redisService.del.mockResolvedValue(undefined);

      await service.create(createRoleDto);
      expect(roleRepository.create).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should create role with menus', async () => {
      const createRoleDto = {
        name: 'New Role',
        roleKey: 'newrole',
        sortOrder: 1,
        dataScope: '1',
        status: '1',
        menuIds: ['menu-1', 'menu-2'],
      };

      const mockMenus = [
        { id: 'menu-1', name: 'Menu 1' },
        { id: 'menu-2', name: 'Menu 2' },
      ];
      menuRepository.find.mockResolvedValue(mockMenus as any);
      roleRepository.create.mockReturnValue(mockRole as any);
      roleRepository.save.mockResolvedValue(mockRole as any);
      redisService.del.mockResolvedValue(undefined);

      await service.create(createRoleDto);

      expect(roleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          menus: mockMenus,
        }),
      );
    });

    it('should throw BadRequestException if some menus do not exist', async () => {
      const createRoleDto = {
        name: 'New Role',
        roleKey: 'newrole',
        sortOrder: 1,
        dataScope: '1',
        status: '1',
        menuIds: ['menu-1', 'menu-2', 'menu-3'],
      };
      menuRepository.find.mockResolvedValue([
        { id: 'menu-1' },
        { id: 'menu-2' },
      ] as any);

      await expect(service.create(createRoleDto)).rejects.toThrow(
        new BadRequestException({ msg: '部分菜单不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException on database error', async () => {
      const createRoleDto = {
        name: 'New Role',
        roleKey: 'newrole',
        sortOrder: 1,
        dataScope: '1',
        status: '1',
        menuIds: ['menu-1'],
      };
      menuRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createRoleDto)).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('list', () => {
    it('should return paginated role list', async () => {
      const roleListDto = {
        pageNum: 0,
        pageSize: 10,
      };
      roleRepository.findAndCount.mockResolvedValue([[mockRole], 1]);

      const result = await service.list(roleListDto);
      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);

    });

    it('should return all roles when pagination is not provided', async () => {
      const roleListDto = {};
      roleRepository.find.mockResolvedValue([mockRole]);

      const result = await service.list(roleListDto);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply name filter', async () => {
      const roleListDto = {
        pageNum: 0,
        pageSize: 10,
        name: 'Admin',
      };
      roleRepository.findAndCount.mockResolvedValue([[mockRole], 1]);

      await service.list(roleListDto);

      const callArgs = roleRepository.findAndCount.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('name');
    });

    it('should apply roleKey filter', async () => {
      const roleListDto = {
        pageNum: 0,
        pageSize: 10,
        roleKey: 'admin',
      };
      roleRepository.findAndCount.mockResolvedValue([[mockRole], 1]);

      await service.list(roleListDto);

      const callArgs = roleRepository.findAndCount.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('roleKey');
    });

    it('should apply status filter', async () => {
      const roleListDto = {
        pageNum: 0,
        pageSize: 10,
        status: '1',
      };
      roleRepository.findAndCount.mockResolvedValue([[mockRole], 1]);

      await service.list(roleListDto);

      expect(roleRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { status: '1' },
        order: { sortOrder: 'ASC' },
        relations: { menus: true },
        select: expect.anything(),
      });
    });

    it('should apply custom sort', async () => {
      const roleListDto = {
        pageNum: 0,
        pageSize: 10,
        sortField: 'name',
        sortOrder: 'desc' as const,
      };
      roleRepository.findAndCount.mockResolvedValue([[mockRole], 1]);

      await service.list(roleListDto);

      expect(roleRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        order: { name: 'DESC' },
        relations: { menus: true },
        select: expect.anything(),
      });

    });

    it('should throw BadRequestException on database error', async () => {
      const roleListDto = {
        pageNum: 0,
        pageSize: 10,
      };
      roleRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(service.list(roleListDto)).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('update', () => {
    it('should update role basic fields', async () => {
      const updateRoleDto = {
        id: 'role-1',
        name: 'Updated Role',
      };
      roleRepository.findOne.mockResolvedValue(mockRole as any);
      roleRepository.save.mockResolvedValue({ ...mockRole, name: 'Updated Role' } as any);
      redisService.del.mockResolvedValue(undefined);
      redisService.delByPattern.mockResolvedValue(undefined);

      await service.update(updateRoleDto);
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should update role menus', async () => {
      const updateRoleDto = {
        id: 'role-1',
        menuIds: ['menu-2', 'menu-3'],
      };

      const newMenus = [
        { id: 'menu-2', name: 'Menu 2' },
        { id: 'menu-3', name: 'Menu 3' },
      ];
      roleRepository.findOne.mockResolvedValue(mockRole as any);
      menuRepository.find.mockResolvedValue(newMenus as any);
      roleRepository.save.mockResolvedValue({ ...mockRole, menus: newMenus } as any);
      redisService.del.mockResolvedValue(undefined);
      redisService.delByPattern.mockResolvedValue(undefined);

      await service.update(updateRoleDto);

      expect(menuRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: expect.anything(),
          }),
        }),
      );
    });

    it('should throw BadRequestException if role not found', async () => {
      const updateRoleDto = {
        id: 'nonexistent',
        name: 'Updated Role',
      };
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateRoleDto)).rejects.toThrow(
        new BadRequestException({ msg: '角色不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException if some menus do not exist', async () => {
      const updateRoleDto = {
        id: 'role-1',
        menuIds: ['menu-1', 'menu-2', 'menu-3'],
      };
      roleRepository.findOne.mockResolvedValue(mockRole as any);
      menuRepository.find.mockResolvedValue([
        { id: 'menu-1' },
        { id: 'menu-2' },
      ] as any);

      await expect(service.update(updateRoleDto)).rejects.toThrow(
        new BadRequestException({ msg: '部分菜单不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException with code 409 on optimistic lock error', async () => {
      const updateRoleDto = {
        id: 'role-1',
        name: 'Updated Role',
      };
      const lockError = new Error('Lock error') as OptimisticLockVersionMismatchError;
      lockError.name = 'OptimisticLockVersionMismatchError';

      roleRepository.findOne.mockResolvedValue(mockRole as any);
      roleRepository.save.mockRejectedValue(lockError);

      await expect(service.update(updateRoleDto)).rejects.toThrow(
        new BadRequestException({
          msg: '数据已被他人修改，请刷新后重�?,
          code: 409,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete role', async () => {
      roleRepository.findOne.mockResolvedValue(mockRole as any);
      roleRepository.softRemove.mockResolvedValue(mockRole as any);
      redisService.del.mockResolvedValue(undefined);
      redisService.delByPattern.mockResolvedValue(undefined);

      await service.delete('role-1');
      expect(roleRepository.softRemove).toHaveBeenCalledWith(mockRole);
    });

    it('should throw BadRequestException if role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        new BadRequestException({ msg: '角色不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException if role has associated users', async () => {
      const roleWithUsers = {
        ...mockRole,
        users: [{ id: 'user-1' }, { id: 'user-2' }],
      };
      roleRepository.findOne.mockResolvedValue(roleWithUsers as any);

      await expect(service.delete('role-1')).rejects.toThrow(
        new BadRequestException({ msg: '角色有关联用户，不能删除', code: 400 }),
      );
    });

    it('should throw BadRequestException on database error', async () => {
      roleRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('role-1')).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });
});
