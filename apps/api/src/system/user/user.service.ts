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
  OptimisticLockVersionMismatchError,
  Repository,
} from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { SysUser } from '@/system/user/entities/user.entity';
import { SysDept } from '@/system/dept/entities/dept.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { SysRole } from '../role/entities/role.entity';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/common/redis/redis.service';

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

  async list(): Promise<SysUser[]> {
    let users: SysUser[] = [];
    try {
      users = await this.userRepository.find({
        relations: {
          dept: true,
          roles: true,
        },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    return users;
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

  async create(createUserDto: CreateUserDto) {
    let dept: SysDept | null = null;
    try {
      if (createUserDto.deptId) {
        dept = await this.deptRepository.findOne({
          where: { id: createUserDto.deptId },
        });
      } else {
        dept = await this.deptRepository.findOne({
          order: { id: 'ASC' },
        });
      }
      if (!dept) {
        throw new BadRequestException({ msg: '部门不存在', code: 400 });
      }
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }

    let roles: Partial<SysRole>[] = [];
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
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
      try {
        const defaultRole = await this.roleRepository.findOne({
          where: { roleKey: 'admin' },
        });
        if (!defaultRole) {
          throw new BadRequestException({
            msg: '默认角色不存在',
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
      avatar: createUserDto.avatar,
      status: createUserDto.status ?? '1',
      createBy: 'system',
      updateBy: 'system',
    });

    try {
      await this.userRepository.save(user);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库保存错误', code: 400 });
    }

    // const user = this.userRepository.create({
    //   account: createUserDto.account,
    //   name: createUserDto.name,
    //   email: createUserDto.email,
    //   sex: createUserDto.sex,
    //   password: await bcrypt.hash(createUserDto.password, 10),
    //   dept: {
    //     id: createUserDto.deptId
    //       ? createUserDto.deptId
    //       : this.configService.get<string>('DEFAULT_DEPT_ID'),
    //   },
    //   roles:
    //     createUserDto.roleIds?.length > 0
    //       ? createUserDto.roleIds.map((id) => ({ id }))
    //       : [{ id: this.configService.get<string>('DEFAULT_ROLE_ID') }],
    //   avatar: createUserDto.avatar ?? '',
    //   status: createUserDto.status ?? '1',
    //   createBy: 'system',
    //   updateBy: 'system',
    // });
    // try {
    //   await this.userRepository.save(user);
    // } catch (e: any) {
    //   throw new BadRequestException({ msg: '数据库保存错误', code: 400 });
    // }
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
    console.log('updateUserDto.id', updateUserDto.id);
    let user: SysUser | null = null;
    try {
      user = await this.userRepository.findOne({
        where: { id: updateUserDto.id },
        relations: {
          dept: true,
          roles: true,
        },
      });
      console.log('user', user);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }

    if (!user) {
      throw new BadRequestException({ msg: '用户不存在', code: 400 });
    }

    const { deptId, roleIds, ...rest } = updateUserDto;
    Object.assign(user, rest);

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
        console.log('updateUserDto.roleIds:', updateUserDto.roleIds);
        console.log('roles:', roles);
        user.roles = roles;
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库更新错误', code: 400 });
      }
    }
    console.log('user:', user);
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
