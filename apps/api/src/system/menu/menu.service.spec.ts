import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import { MenuService } from './menu.service';
import { SysMenu } from './entities/menu.entity';
import { RedisService } from '@/common/redis/redis.service';
import { AlsService } from '@/common/als/als.service';

// Mock toFrontendDto function
jest.mock('./mapper/to-fronted_menu', () => ({
  toFrontendDto: jest.fn((menu) => ({
    id: menu.id,
    name: menu.name,
    path: menu.path,
    parentId: menu.parentId,
    menuType: menu.menuType,
    sortOrder: menu.sortOrder,
    status: menu.status,
    children: [],
  })),
}));

describe('MenuService', () => {
  let service: MenuService;
  let menuRepository: jest.Mocked<Repository<SysMenu>>;
  let redisService: jest.Mocked<RedisService>;
  let alsService: jest.Mocked<AlsService>;

  const mockParentMenu = {
    id: 'menu-1',
    name: 'Parent Menu',
    parentId: '0',
    path: '/parent',
  };

  const mockMenu = {
    id: 'menu-2',
    name: 'Test Menu',
    parentId: 'menu-1',
    path: '/test',
    menuType: 'C',
    sortOrder: 1,
    status: '1',
  };

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    query: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(SysMenu),
          useFactory: mockRepository,
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            delByPattern: jest.fn(),
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

    service = module.get<MenuService>(MenuService);
    menuRepository = module.get(getRepositoryToken(SysMenu));
    redisService = module.get(RedisService);
    alsService = module.get(AlsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create top level menu without parentId', async () => {
      const createMenuDto = {
        name: 'New Menu',
        path: '/new',
        menuType: 'C',
        sortOrder: 1,
        status: '1',
      };

      menuRepository.create.mockReturnValue(mockMenu as any);
      menuRepository.save.mockResolvedValue(mockMenu as any);
      redisService.delByPattern.mockResolvedValue(undefined);

      await service.create(createMenuDto);

      expect(menuRepository.create).toHaveBeenCalledWith({
        name: 'New Menu',
        path: '/new',
        menuType: 'C',
        sortOrder: 1,
        status: '1',
      });
      expect(menuRepository.save).toHaveBeenCalled();
      expect(redisService.delByPattern).toHaveBeenCalledWith('menu:list:*');
    });

    it('should create menu with parent', async () => {
      const createMenuDto = {
        name: 'New Menu',
        parentId: 'menu-1',
        path: '/new',
        menuType: 'C',
        sortOrder: 1,
        status: '1',
      };

      menuRepository.findOne.mockResolvedValue(mockParentMenu as any);
      menuRepository.create.mockReturnValue(mockMenu as any);
      menuRepository.save.mockResolvedValue(mockMenu as any);
      redisService.delByPattern.mockResolvedValue(undefined);

      await service.create(createMenuDto);

      expect(menuRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'menu-1' },
      });
      expect(menuRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if parent menu not found', async () => {
      const createMenuDto = {
        name: 'New Menu',
        parentId: 'nonexistent',
        path: '/new',
        menuType: 'C',
        sortOrder: 1,
        status: '1',
      };

      menuRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createMenuDto)).rejects.toThrow(
        new BadRequestException({ msg: '父菜单不存在', code: 400 }),
      );
    });

    it('should throw BadRequestException on database error', async () => {
      const createMenuDto = {
        name: 'New Menu',
        parentId: 'menu-1',
        path: '/new',
        menuType: 'C',
        sortOrder: 1,
        status: '1',
      };

      menuRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createMenuDto)).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('list', () => {
    it('should return cached menu list if available', async () => {
      const cachedMenus = [
        { id: 'menu-1', name: 'Menu 1', children: [] },
      ];
      alsService.getUserId.mockReturnValue('user-1');
      redisService.get.mockResolvedValue(cachedMenus as any);

      const result = await service.list();

      expect(redisService.get).toHaveBeenCalledWith('menu:list:user-1');
      expect(result).toEqual(cachedMenus);
      expect(menuRepository.find).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when no cached data', async () => {
      const menus = [mockParentMenu, mockMenu];
      alsService.getUserId.mockReturnValue('user-1');
      redisService.get.mockResolvedValue(null);
      menuRepository.find.mockResolvedValue(menus as any);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.list();

      expect(menuRepository.find).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith(
        'menu:list:user-1',
        expect.anything(),
        86400,
      );
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException on database error', async () => {
      alsService.getUserId.mockReturnValue('user-1');
      redisService.get.mockResolvedValue(null);
      menuRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.list()).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('get', () => {
    it('should return menu by id', async () => {
      menuRepository.findOne.mockResolvedValue(mockMenu as any);

      const result = await service.get('menu-2');

      expect(result).toEqual(mockMenu);
      expect(menuRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'menu-2' },
      });
    });

    it('should throw BadRequestException if menu not found', async () => {
      menuRepository.findOne.mockResolvedValue(null);

      await expect(service.get('nonexistent')).rejects.toThrow(
        new BadRequestException({ msg: '菜单不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException on database error', async () => {
      menuRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.get('menu-2')).rejects.toThrow(
        new BadRequestException({ msg: '数据库查询错�?, code: 400 }),
      );
    });
  });

  describe('update', () => {
    it('should update menu', async () => {
      const updateMenuDto = {
        id: 'menu-2',
        name: 'Updated Menu',
      };

      const updatedMenu = { ...mockMenu, name: 'Updated Menu' };

      menuRepository.findOne.mockResolvedValue(mockMenu as any);
      menuRepository.save.mockResolvedValue(updatedMenu as any);
      redisService.delByPattern.mockResolvedValue(undefined);

      await service.update(updateMenuDto);

      expect(menuRepository.save).toHaveBeenCalled();
      expect(redisService.delByPattern).toHaveBeenCalledWith('menu:list:*');
    });

    it('should throw BadRequestException if menu not found', async () => {
      const updateMenuDto = {
        id: 'nonexistent',
        name: 'Updated Menu',
      };

      menuRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateMenuDto)).rejects.toThrow(
        new BadRequestException({ msg: '菜单不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException with code 409 on optimistic lock error', async () => {
      const updateMenuDto = {
        id: 'menu-2',
        name: 'Updated Menu',
      };

      const lockError = new Error('Lock error') as OptimisticLockVersionMismatchError;
      lockError.name = 'OptimisticLockVersionMismatchError';

      menuRepository.findOne.mockResolvedValue(mockMenu as any);
      menuRepository.save.mockRejectedValue(lockError);

      await expect(service.update(updateMenuDto)).rejects.toThrow(
        new BadRequestException({
          msg: '数据已被他人修改，请刷新后重�?,
          code: 409,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete menu without submenus', async () => {
      menuRepository.findOne.mockResolvedValue(mockMenu as any);
      menuRepository.query.mockResolvedValue([]);
      menuRepository.softRemove.mockResolvedValue(mockMenu as any);
      redisService.delByPattern.mockResolvedValue(undefined);

      await service.delete('menu-2');

      expect(menuRepository.softRemove).toHaveBeenCalledWith(mockMenu);
      expect(redisService.delByPattern).toHaveBeenCalledWith('menu:list:*');
    });

    it('should delete menu with submenus', async () => {
      const subMenus = [
        { id: 'submenu-1', name: 'Submenu 1' },
        { id: 'submenu-2', name: 'Submenu 2' },
      ];

      menuRepository.findOne.mockResolvedValue(mockMenu as any);
      menuRepository.query.mockResolvedValue(subMenus);
      menuRepository.softRemove.mockResolvedValue(mockMenu as any);
      redisService.delByPattern.mockResolvedValue(undefined);

      await service.delete('menu-2');

      expect(menuRepository.softRemove).toHaveBeenCalledWith([...subMenus, mockMenu]);
    });

    it('should throw BadRequestException if menu not found', async () => {
      menuRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        new BadRequestException({ msg: '菜单不存�?, code: 400 }),
      );
    });

    it('should throw BadRequestException on query error', async () => {
      menuRepository.findOne.mockResolvedValue(mockMenu as any);
      menuRepository.query.mockRejectedValue(new Error('Query error'));

      await expect(service.delete('menu-2')).rejects.toThrow(
        new BadRequestException({ msg: '查询子菜单失�?, code: 400 }),
      );
    });
  });
});
