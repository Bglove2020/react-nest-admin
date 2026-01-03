import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleListDto } from './dto/role-list.dto';
import { SysRole } from './entities/role.entity';
import { SysMenu } from '../menu/entities/menu.entity';
import { SysUser } from '../user/entities/user.entity';
import { RedisService } from '@/common/redis/redis.service';
import { removeUndefined } from '@/common/utils/remove-undefined.util';

@Injectable()
export class RoleService {
  private readonly ROLE_LIST_CACHE_KEY = 'system:role:list';

  constructor(
    @InjectRepository(SysRole)
    private roleRepository: Repository<SysRole>,
    @InjectRepository(SysMenu)
    private menuRepository: Repository<SysMenu>,
    @InjectRepository(SysUser)
    private userRepository: Repository<SysUser>,
    private readonly redisService: RedisService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<void> {
    let menus: SysMenu[] = [];
    if (createRoleDto.menuIds && createRoleDto.menuIds.length > 0) {
      try {
        menus = await this.menuRepository.find({
          where: { id: In(createRoleDto.menuIds) },
        });
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
      }
      if (menus.length !== createRoleDto.menuIds.length) {
        throw new BadRequestException({ msg: '部分菜单不存在', code: 400 });
      }
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      roleKey: createRoleDto.roleKey,
      sortOrder: createRoleDto.sortOrder,
      dataScope: createRoleDto.dataScope,
      status: createRoleDto.status,
      createBy: 'system',
      updateBy: 'system',
      menus,
    });

    try {
      await this.roleRepository.save(role);
      // 清理角色列表缓存
      await this.redisService.del(this.ROLE_LIST_CACHE_KEY);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库保存错误', code: 400 });
    }
  }

  async list(roleListDto: RoleListDto): Promise<{
    list: SysRole[];
    total: number;
  }> {
    try {
      const { pageNum, pageSize, name, roleKey, status, sortField, sortOrder } = roleListDto;

      // 构建查询条件
      const where = this.buildWhereCondition({ name, roleKey, status });

      // 构建排序条件
      const order: Record<string, 'ASC' | 'DESC'> = {};
      const validSortFields = ['name', 'roleKey', 'sortOrder', 'createTime'];
      if (sortField && validSortFields.includes(sortField)) {
        order[sortField] = sortOrder === 'asc' ? 'ASC' : 'DESC';
      } else {
        // 默认按排序字段升序
        order.sortOrder = 'ASC';
      }

      // 判断是否分页
      const isPaginated = pageNum !== undefined && pageSize !== undefined;

      // 执行查询
      if (isPaginated) {
        // 分页查询
        const [list, total] = await this.roleRepository.findAndCount({
          skip: pageNum * pageSize,
          take: pageSize,
          where,
          order,
          relations: {
            menus: true,
          },
          select: {
            id: true,
            name: true,
            roleKey: true,
            sortOrder: true,
            status: true,
            remark: true,
            menus: {
              id: true,
            },
          },
        });
        return { list, total };
      } else {
        // 查询全部
        const list = await this.roleRepository.find({
          where,
          order,
          relations: {
            menus: true,
          },
          select: {
            id: true,
            name: true,
            roleKey: true,
            sortOrder: true,
            status: true,
            remark: true,
            menus: {
              id: true,
            },
          },
        });
        return { list, total: list.length };
      }
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
  }

  private buildWhereCondition(filters: {
    name?: string;
    roleKey?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.name) {
      where.name = Like(`%${filters.name}%`);
    }

    if (filters.roleKey) {
      where.roleKey = Like(`%${filters.roleKey}%`);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }

  async update(updateRoleDto: UpdateRoleDto) {
    let role: SysRole | null = null;
    try {
      role = await this.roleRepository.findOne({
        where: { id: updateRoleDto.id },
        relations: { menus: true },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!role) {
      throw new BadRequestException({ msg: '角色不存在', code: 400 });
    }
    const { menuIds, ...rest } = updateRoleDto;

    Object.assign(role, removeUndefined(rest));

    if (menuIds) {
      let menus: SysMenu[] = [];
      try {
        menus = await this.menuRepository.find({ where: { id: In(menuIds) } });
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
      }
      if (menus.length !== menuIds.length) {
        throw new BadRequestException({ msg: '部分菜单不存在', code: 400 });
      }
      role.menus = menus;
    }

    try {
      await this.roleRepository.save(role);
      // 角色权限变更，清理角色列表缓存和所有用户的菜单缓存
      await Promise.all([
        this.redisService.del(this.ROLE_LIST_CACHE_KEY),
        this.redisService.delByPattern('menu:list:*'),
      ]);
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

  async delete(id: string) {
    let role: SysRole | null = null;
    try {
      role = await this.roleRepository.findOne({
        where: { id },
        relations: {
          users: true,
        },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!role) {
      throw new BadRequestException({ msg: '角色不存在', code: 400 });
    }
    if (role.users.length > 0) {
      throw new BadRequestException({
        msg: '角色有关联用户，不能删除',
        code: 400,
      });
    }

    try {
      await this.roleRepository.softRemove(role);
      // 角色删除，清理角色列表缓存和菜单缓存
      await Promise.all([
        this.redisService.del(this.ROLE_LIST_CACHE_KEY),
        this.redisService.delByPattern('menu:list:*'),
      ]);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库删除错误', code: 400 });
    }
  }
}
