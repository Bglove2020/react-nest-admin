import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import type { FrontendMenu, FrontendMenuBase } from '@ruoyi/contracts';
import { SysMenu } from './entities/menu.entity';
import { buildTree } from '@/common/utils/build-tree.util';
import { toFrontendDto } from './mapper/to-fronted_menu';
import { AlsService } from '@/common/als/als.service';
import { RedisService } from '@/common/redis/redis.service';
import { Transactional } from 'typeorm-transactional';
import { removeUndefined } from '@/common/utils/remove-undefined.util';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(SysMenu)
    private menuRepository: Repository<SysMenu>,
    private readonly redisService: RedisService,
    private readonly alsService: AlsService,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    let parentMenu: SysMenu | null = null;
    if (createMenuDto.parentId && createMenuDto.parentId !== '0') {
      try {
        parentMenu = await this.menuRepository.findOne({
          where: { id: createMenuDto.parentId },
        });
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
      }
      if (!parentMenu) {
        throw new BadRequestException({ msg: '父菜单不存在', code: 400 });
      }
    }
    const menu = this.menuRepository.create(createMenuDto);
    if (!menu.parentId) {
      menu.parentId = '0';
    }

    try {
      await this.menuRepository.save(menu);
      // 清理菜单列表缓存
      await this.redisService.delByPattern('menu:list:*');
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库保存错误', code: 400 });
    }
  }

  async list(): Promise<FrontendMenu[]> {
    const userId = this.alsService.getUserId();
    const cachedData = await this.redisService.get<FrontendMenu[]>(
      `menu:list:${userId}`,
    );
    if (cachedData) {
      console.log('查询到缓存数据', cachedData);
      return cachedData;
    }
    console.log('未查询到缓存数据');
    let menus: SysMenu[] = [];
    try {
      menus = await this.menuRepository.find();
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    const result = buildTree<SysMenu, FrontendMenuBase>(menus, toFrontendDto);
    this.redisService.set(`menu:list:${userId}`, result, 60 * 60 * 24);
    return result;
  }

  async get(id: string) {
    let menu: SysMenu | null = null;
    try {
      menu = await this.menuRepository.findOne({ where: { id } });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!menu) {
      throw new BadRequestException({ msg: '菜单不存在', code: 400 });
    }
    return menu;
  }

  async update(updateMenuDto: UpdateMenuDto) {
    let menu: SysMenu | null = null;
    try {
      menu = await this.menuRepository.findOne({
        where: { id: updateMenuDto.id },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!menu) {
      throw new BadRequestException({ msg: '菜单不存在', code: 400 });
    }

    Object.assign(menu, removeUndefined(updateMenuDto));

    try {
      await this.menuRepository.save(menu);
      // 清理菜单列表缓存
      await this.redisService.delByPattern('menu:list:*');
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

  @Transactional()
  async delete(id: string) {
    let menu: SysMenu | null = null;
    try {
      menu = await this.menuRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!menu) {
      throw new BadRequestException({ msg: '菜单不存在', code: 400 });
    }

    // 使用递归 CTE 查询所有子孙菜单的 ID
    let subMenus: SysMenu[] = [];
    try {
      subMenus = await this.menuRepository.query(
        `
        WITH RECURSIVE menu_tree AS (
          SELECT id FROM sys_menu WHERE parent_id = ? AND deleted_at IS NULL
          UNION ALL
          SELECT m.id FROM sys_menu m
          INNER JOIN menu_tree mt ON m.parent_id = mt.id
          WHERE m.deleted_at IS NULL
        )
        SELECT * FROM menu_tree
        `,
        [id],
      );
    } catch (e: any) {
      throw new BadRequestException({ msg: '查询子菜单失败', code: 400 });
    }
    console.log('子菜单', subMenus);

    try {
      if (subMenus.length > 0) {
        await this.menuRepository.softRemove([...subMenus, menu]);
      } else {
        await this.menuRepository.softRemove(menu);
      }
      // 清理菜单列表缓存
      await this.redisService.delByPattern('menu:list:*');
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库删除错误', code: 400 });
    }
  }
}
