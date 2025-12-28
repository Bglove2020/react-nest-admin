import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { CreateDeptDto } from './dto/create-dept.dto';
import { UpdateDeptDto } from './dto/update-dept.dto';
import { SysDept } from './entities/dept.entity';
import { buildTree } from '@/common/utils/build-tree.util';
import type { FrontendDept } from '@ruoyi/contracts';
import { toFrontendDeptDto } from './mapper/dept.mapper';
import { SysUser } from '../user/entities/user.entity';
import { RedisService } from '@/common/redis/redis.service';
import { AlsService } from '@/common/als/als.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class DeptService {
  constructor(
    @InjectRepository(SysDept)
    private deptRepository: Repository<SysDept>,
    @InjectRepository(SysUser)
    private userRepository: Repository<SysUser>,
    private readonly redisService: RedisService,
    private readonly alsService: AlsService,
  ) {}

  async create(createDeptDto: CreateDeptDto) {
    // 如果没有传父部门id，则默认为顶级部门，父部门id为0
    let parentDept: SysDept | null = null;
    if (createDeptDto.parentId) {
      try {
        parentDept = await this.deptRepository.findOne({
          where: { id: createDeptDto.parentId },
        });
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
      }
      if (!parentDept) {
        throw new BadRequestException({ msg: '父部门不存在', code: 400 });
      }
    }

    // 如果有负责人字段，根据leaderId查询负责人
    let leader: SysUser | null = null;
    if (createDeptDto.leaderId) {
      try {
        leader = await this.userRepository.findOne({
          where: { id: createDeptDto.leaderId },
        });
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
      }
      if (!leader) {
        throw new BadRequestException({ msg: '负责人不存在', code: 400 });
      }
    }

    const dept = this.deptRepository.create({
      name: createDeptDto.name,
      parentId: parentDept?.id ?? '0',
      leader: leader ? leader : null,
      sortOrder: createDeptDto.sortOrder,
      status: createDeptDto.status,
    });

    try {
      await this.deptRepository.save(dept);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库保存错误', code: 400 });
    }
  }

  async list() {
    // const userId = this.alsService.getUserId();
    // const cachedData = await this.redisService.get<FrontendDept[]>(
    //   `dept:list:${userId}`,
    // );
    // if (cachedData) {
    //   console.log('查询到缓存数据', cachedData);
    //   return cachedData;
    // }
    // console.log('未查询到缓存数据');
    let rawData: SysDept[] = [];
    try {
      rawData = await this.deptRepository.find({ relations: { leader: true } });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    const result = buildTree<SysDept, FrontendDept>(rawData, toFrontendDeptDto);
    // this.redisService.set(`dept:list:${userId}`, result, 60 * 60 * 24);
    return result;
  }

  async update(updateDeptDto: UpdateDeptDto) {
    let dept: SysDept | null = null;
    try {
      dept = await this.deptRepository.findOne({
        where: { id: updateDeptDto.id },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!dept) {
      throw new BadRequestException({ msg: '部门不存在', code: 400 });
    }

    if (updateDeptDto.parentId) {
      throw new BadRequestException({ msg: '不允许更新父部门', code: 400 });
    }
    const { leaderId, ...rest } = updateDeptDto;
    Object.assign(dept, rest);

    // 如果有负责人字段，根据leaderId查询负责人
    if (leaderId && leaderId !== dept.leader?.id) {
      try {
        dept.leader = await this.userRepository.findOne({
          where: { id: leaderId },
        });
      } catch (e: any) {
        throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
      }
      if (!dept.leader) {
        throw new BadRequestException({ msg: '负责人不存在', code: 400 });
      }
    }

    try {
      await this.deptRepository.save(dept);
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
    let dept: SysDept | null = null;
    try {
      dept = await this.deptRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }
    if (!dept) {
      throw new BadRequestException({ msg: '部门不存在或已删除', code: 400 });
    }

    // 使用递归 CTE 查询所有子孙部门的 ID
    let childDeptIds: { id: string }[] = [];
    try {
      childDeptIds = await this.deptRepository.query(
        `
        WITH RECURSIVE dept_tree AS (
          SELECT id FROM sys_dept WHERE parent_id = ? AND deleted_at IS NULL
          UNION ALL
          SELECT d.id FROM sys_dept d
          INNER JOIN dept_tree dt ON d.parent_id = dt.id
          WHERE d.deleted_at IS NULL
        )
        SELECT id FROM dept_tree
        `,
        [id],
      );
    } catch (e: any) {
      throw new BadRequestException({ msg: '查询子部门失败', code: 400 });
    }

    const allDeptIds = [id, ...childDeptIds.map((d) => d.id)];
    let childDepts: SysDept[] = [];
    try {
      childDepts = await this.deptRepository.findByIds(allDeptIds);
    } catch (e: any) {
      throw new BadRequestException({ msg: '查询部门实体失败', code: 400 });
    }

    try {
      await this.deptRepository.softRemove(childDepts);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库删除错误', code: 400 });
    }

    let users: SysUser[] = [];
    try {
      users = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.dept', 'dept')
        .where('user.dept_id IN (:...deptIds)', { deptIds: allDeptIds })
        .getMany();
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库查询错误', code: 400 });
    }

    try {
      await this.userRepository.softRemove(users);
    } catch (e: any) {
      throw new BadRequestException({ msg: '数据库删除错误', code: 400 });
    }

    return { childCount: childDeptIds.length, userCount: users.length };
  }
}
