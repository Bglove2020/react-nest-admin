import { SysRole } from '../entities/role.entity';
import type { FrontendRole } from '@ruoyi/contracts';

export function toFrontendDto(role: SysRole): FrontendRole{
    return {
        id: role.id,
        name: role.name,
        roleKey: role.roleKey,
        sortOrder: role.sortOrder,
        status: role.status,
        menuIds: role.menus.map((menu) => menu.id),
    };
}

export function toFrontendDtoList(roles: SysRole[]): FrontendRole[]{
    return roles.map((role) => toFrontendDto(role));
}
