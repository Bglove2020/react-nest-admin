import type { FrontendDept } from '@ruoyi/contracts';
import { SysDept } from '../entities/dept.entity';

export function toFrontendDeptDto(dept: SysDept): FrontendDept {
  return {
    id: dept.id,
    name: dept.name,
    sortOrder: dept.sortOrder,
    leaderId: dept.leader?.id,
    leaderName: dept.leader?.name,
    leaderEmail: dept.leader?.email,
    status: dept.status,
    children: [],
  };
}
