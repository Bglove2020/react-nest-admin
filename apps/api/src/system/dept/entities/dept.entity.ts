import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  DeleteDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { SysUser } from '@/system/user/entities/user.entity';

// 定义一个typeORM实体类的步骤
// 1. 导入Entity, PrimaryColumn,
// 2. 使用@Entity()装饰器标记该类为一个实体类，传入一个参数用于指定表名�?
// 3. 使用@PrimaryColumn()装饰器标记主键列
// 4. 使用@Column()装饰器标记其他列
// 5. 定义其他关系装饰器，如@OneToMany, @ManyToOne, @ManyToMany�?

// mysql在windows平台下不区分数据库名、表名、列名的大小写，因此建议使用小写字母+下划线的形式
@Entity('sys_dept')
@Index('uniq_sys_dept_active_name', ['activeName'], { unique: true })
export class SysDept {
  @PrimaryColumn('char', {
    name: 'id',

    length: 36,
    comment: '部门id，唯一且与id一一对应，用于对外暴露',
  })
  id: string;

  @Column({
    name: 'name',
    comment: '部门名称',
  })
  name: string;

  @Column({
    name: 'active_name',
    type: 'varchar',
    length: 320,
    asExpression:
      "case when deleted_at is null then name else concat(name, '#', id) end",
    generatedType: 'VIRTUAL',
    select: false,
  })
  activeName: string;

  @Column({
    name: 'parent_id',
    type: 'char',
    length: 36,
    default: '0',
    comment: '父部门id（表示根部门）',
  })
  parentId: string;

  @Column({
    name: 'sort_order',
    type: 'int',
    comment: '显示顺序',
  })
  sortOrder: number;

  @Column({
    name: 'status',
    default: '1',
    comment: '部门状态（0停用 1正常）',
  })
  status: string;

  @ManyToOne(() => SysUser, { nullable: true })
  @JoinColumn({ name: 'leader_id' })
  leader: SysUser | null;

  @Column({
    name: 'update_by',
    nullable: true,
    comment: '更新者',
  })
  updateBy: string;

  @Column({
    name: 'create_by',
    nullable: true,
    comment: '创建者',
  })
  createBy: string;

  @CreateDateColumn({
    name: 'create_time',
    nullable: true,
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    name: 'update_time',
    nullable: true,
    comment: '更新时间',
  })
  updateTime: Date;

  @VersionColumn({
    name: 'version',
    default: 0,
    comment: '版本号（用于乐观锁）',
  })
  version: number;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    comment: '删除时间',
  })
  deletedAt: Date | null;

  @BeforeInsert()
  setId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  // @OneToMany(() => SysUser, (user) => user.dept)
  // users: SysUser[];
}
