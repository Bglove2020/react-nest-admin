import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  In,
  IsNull,
  Like,
  OptimisticLockVersionMismatchError,
  Repository,
} from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { SysUser } from '@/system/user/entities/user.entity';
import { SysDept } from '@/system/dept/entities/dept.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListDto } from './dto/user-list.dto';
import * as bcrypt from 'bcryptjs';
import { SysRole } from '../role/entities/role.entity';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/common/redis/redis.service';
import { removeUndefined } from '@/common/utils/remove-undefined.util';
import { RegisterDto } from '@/auth/dto/register.dto';

@Injectable()
export class UserService {
  private readonly AUTH_USER_CACHE_PREFIX = 'user-info-roles-permissions:';

  constructor(
    @InjectRepository(SysUser)
    private userRepository: Repository<SysUser>,
    @InjectRepository(SysDept)
    private deptRepository: Repository<SysDept>,
    @InjectRepository(SysRole)
    private roleRepository: Repository<SysRole>,
    private configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async list(userListDto: UserListDto): Promise<{
    list: SysUser[];
    total: number;
  }> {
    try {
      const { pageNum, pageSize, account, sex, status, sortField, sortOrder } = userListDto;

      // 构建查询条件
      const where = this.buildWhereCondition({ account, sex, status });

      // 构建排序条件
      const order: Record<string, 'ASC' | 'DESC'> = {};
      const validSortFields = ['account', 'createTime', 'updateTime'];
      if (sortField && validSortFields.includes(sortField)) {
        order[sortField] = sortOrder === 'asc' ? 'ASC' : 'DESC';
      } else {
        // 默认按创建时间倒序
        order.createTime = 'DESC';
      }

      // 判断是否分页
      const isPaginated = pageNum !== undefined && pageSize !== undefined;

      // 执行查询
      if (isPaginated) {
        // 分页查询
        const [list, total] = await this.userRepository.findAndCount({
          skip: pageNum * pageSize,
          take: pageSize,
          where,
          order,
          relations: {
            dept: true,
            roles: true,
          },
        });
        return { list, total };
      } else {
        // 查询全部
        const list = await this.userRepository.find({
          where,
          order,
          relations: {
            dept: true,
            roles: true,
          },
        });
        return { list, total: list.length };
      }
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
  }

  private buildWhereCondition(filters: {
    account?: string;
    sex?: string;
    status?: string[];
  }) {
    const where: any = {};

    if (filters.account) {
      where.account = Like(`%${filters.account}%`);
    }

    if (filters.sex && filters.sex !== '') {
      where.sex = filters.sex;
    }

    if (filters.status && filters.status.length > 0) {
      where.status = In(filters.status);
    }

    return where;
  }

  async get(id: string) {
    let user: SysUser | null = null;
    try {
      user = await this.userRepository.findOne({
        where: { id },
        relations: {
          dept: true,
          roles: true,
        },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    return user;
  }

  async getByAccount(account: string): Promise<SysUser | null> {
    try {
      return await this.userRepository.findOne({
        where: { account },
        relations: {
          dept: true,
          roles: true,
        },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
  }

  async create(createUserDto: CreateUserDto | RegisterDto) {
    let dept: SysDept | null = null;
    try {
      if ('deptId' in createUserDto && createUserDto.deptId) {
        dept = await this.deptRepository.findOne({
          where: { id: createUserDto.deptId },
        });
      } else {
        const depts = await this.deptRepository.find({
          order: { id: 'ASC' },
          take: 1,
        });
        dept = depts.length > 0 ? depts[0] : null;
      }
      if (!dept) {
        throw new BadRequestException({ msg: '部门不存在', code: 400 });
      }
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }

    let roles: Partial<SysRole>[] = [];
    if (
      'roleIds' in createUserDto &&
      createUserDto.roleIds &&
      createUserDto.roleIds.length > 0
    ) {
      try {
        roles = await this.roleRepository.find({
          where: { id: In(createUserDto.roleIds) },
        });
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
      }
      if (roles.length !== createUserDto.roleIds.length) {
        throw new BadRequestException({ msg: '部分角色不存在', code: 400 });
      }
    } else {
      // 使用默认普通用户角色（通过 roleKey 查询）
      try {
        const defaultRole = await this.roleRepository.findOne({
          where: { roleKey: 'user' },
        });
        if (!defaultRole) {
          throw new BadRequestException({
            msg: '默认用户角色不存在，请先运行数据库初始化',
            code: 400,
          });
        }
        roles = [defaultRole];
      } catch (e: any) {
        if (e instanceof BadRequestException) {
          throw e;
        }
        throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      account: createUserDto.account,
      name: createUserDto.name,
      email: createUserDto.email,
      sex: createUserDto.sex,
      password: hashedPassword,
      dept: dept,
      roles: roles,
      status: 'status' in createUserDto ? createUserDto.status : '1',
      createBy: 'system',
      updateBy: 'system',
    });

    try {
      await this.userRepository.save(user);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库保存错误', code: 400 });
    }
  }

  async resetPassword(resetPasswordDto: ResetUserPasswordDto) {
    let user: SysUser | null = null;
    try {
      user = await this.userRepository.findOne({
        where: { id: resetPasswordDto.id },
      });
      if (!user) {
        throw new BadRequestException({ msg: '用户不存在', code: 400 });
      }
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库更新错误', code: 400 });
    }
    user.password = await bcrypt.hash(resetPasswordDto.password, 10);
    try {
      await this.userRepository.save(user);
      // 清除该用户的鉴权权限缓存
      await this.redisService.del(`${this.AUTH_USER_CACHE_PREFIX}${user.id}`);
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
    let user: SysUser | null = null;
    try {
      user = await this.userRepository.findOne({
        where: { id },
        relations: {
          dept: true,
          leaderDepts: true,
        },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }

    if (!user) {
      throw new BadRequestException({ msg: '用户不存在', code: 400 });
    }
    if (user.leaderDepts.length > 0) {
      throw new BadRequestException({
        msg: '用户是院系负责人，不能删除',
        code: 400,
      });
    }

    try {
      await this.userRepository.softRemove(user);
      // 用户被删除，清理相关鉴权和菜单缓存
      await this.redisService.del(`${this.AUTH_USER_CACHE_PREFIX}${id}`);
      await this.redisService.del(`menu:list:${id}`);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库删除错误', code: 400 });
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    // 检查用户是否存在
    let user: SysUser | null = null;
    try {
      user = await this.userRepository.findOne({
        where: { id: updateUserDto.id },
        relations: {
          dept: true,
          roles: true,
        },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }

    if (!user) {
      throw new BadRequestException({ msg: '用户不存在', code: 400 });
    }

    const { deptId, roleIds, ...rest } = updateUserDto;
    Object.assign(user, removeUndefined(rest));

    // 如果有deptId，且与当前院系不同，则更新院系
    if (updateUserDto.deptId && updateUserDto.deptId !== user.dept?.id) {
      try {
        const dept = await this.deptRepository.findOne({
          where: { id: updateUserDto.deptId },
        });
        if (!dept) {
          throw new BadRequestException({ msg: '部门不存在', code: 400 });
        }
        user.dept = dept;
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库更新错误', code: 400 });
      }
    }

    // 如果有roleIds，则更新角色，不需要不同
    if (updateUserDto.roleIds) {
      try {
        const roles = await this.roleRepository.find({
          where: { id: In(updateUserDto.roleIds) },
        });
        if (roles.length !== updateUserDto.roleIds.length) {
          throw new BadRequestException({ msg: '部分角色不存在', code: 400 });
        }
        user.roles = roles;
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库更新错误', code: 400 });
      }
    }

    try {
      await this.userRepository.save(user);
      // 用户信息或角色变更，清理相关鉴权和菜单缓存
      await this.redisService.del(`${this.AUTH_USER_CACHE_PREFIX}${user.id}`);
      await this.redisService.del(`menu:list:${user.id}`);
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
}
