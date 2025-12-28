import { SysUser } from '../entities/user.entity';
import type { FrontendUser } from '@ruoyi/contracts';

export function toFrontendDto(user: SysUser): FrontendUser {
  return {
    id: user.id,
    account: user.account,
    name: user.name,
    email: user.email,
    sex: user.sex,
    avatar: user.avatar,
    status: user.status,
    deptId: user.dept.id,
    deptName: user.dept.name,
    roleIds: user.roles.map((role) => role.id),
  };
}

export function toFrontendListDtos(users: SysUser[]): FrontendUser[] {
  return users.map((u) => toFrontendDto(u));
}
