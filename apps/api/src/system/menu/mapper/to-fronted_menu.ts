import { SysMenu } from '../entities/menu.entity';
import type { FrontendMenuBase } from '@ruoyi/contracts';

export function toFrontendDto(menu: SysMenu): FrontendMenuBase {
  return {
    publicId: menu.publicId,
    name: menu.name,
    sortOrder: menu.sortOrder,
    path: menu.path,
    isFrame: menu.isFrame,
    menuType: menu.menuType,
    visible: menu.visible,
    status: menu.status,
    perms: menu.perms,
    createBy: menu.createBy,
    createTime: menu.createTime.toISOString(),
    updateBy: menu.updateBy,
    updateTime: menu.updateTime.toISOString(),
    remark: menu.remark,
  };
}
