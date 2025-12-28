import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { SysDictData } from './dict-data.entity';
import { v7 as uuidv7 } from 'uuid';

@Entity('sys_dict_type')
@Index('uniq_sys_dict_type_active', ['activeType'], { unique: true })
@Index('uniq_sys_dict_name_active', ['activeName'], { unique: true })
export class SysDict {
  @PrimaryColumn('char', {
    name: 'id',

    length: 36,
    comment: '字典类型公开id，唯一且与id一一对应，用于对外暴露',
  })
  id: string;

  @Column({ name: 'name', length: 100, comment: '字典名称' })
  name: string;

  @Column({
    name: 'active_name',
    type: 'varchar',
    length: 180,
    asExpression:
      "case when deleted_at is null then name else concat(name, '#', id) end",
    generatedType: 'VIRTUAL',
    select: false,
    insert: false,
    update: false,
  })
  activeName: string;

  @Column({ name: 'type', length: 100, comment: '字典类型标识' })
  type: string;

  @Column({
    name: 'active_type',
    type: 'varchar',
    length: 200,
    asExpression:
      "case when deleted_at is null then type else concat(type, '#', id) end",
    generatedType: 'VIRTUAL',
    select: false,
    insert: false,
    update: false,
  })
  activeType: string;

  @Column({
    name: 'status',
    length: 1,
    default: '1',
    comment: '状态（0停用 1正常）',
  })
  status: string;

  @Column({
    name: 'sort_order',
    type: 'int',
    comment: '显示顺序',
  })
  sortOrder: number;

  @Column({
    name: 'create_by',
    length: 64,
    default: '',
    comment: '创建者',
    nullable: true,
  })
  createBy: string;

  @CreateDateColumn({
    name: 'create_time',
    type: 'datetime',
    comment: '创建时间',
  })
  createTime: Date;

  @Column({
    name: 'update_by',
    length: 64,
    default: '',
    comment: '更新者',
    nullable: true,
  })
  updateBy: string;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    comment: '更新时间',
  })
  updateTime: Date;

  @VersionColumn({ name: 'version', default: 0, comment: '版本号' })
  version: number;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    comment: '删除时间',
  })
  deletedAt: Date | null = null;

  @OneToMany(() => SysDictData, (data) => data.dict)
  dictData: SysDictData[];

  @BeforeInsert()
  setDefaultValues() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
