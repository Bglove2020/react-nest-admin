import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import type { UserInfo, SideBarItem, UserRouterItem } from '@ruoyi/contracts';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('getInfo')
  async getInfo() {
    const data = await this.profileService.getInfo();
    return {
      code: 200,
      msg: '获取成功',
      data,
      logdata: { userId: data.user.id, userName: data.user.name },
    };
  }

  @Get('getRouters')
  async getRouters() {
    const data = await this.profileService.getRouters();
    return {
      code: 200,
      msg: '获取成功',
      data,
      logdata: { count: data.length },
    };
  }

  @Get('getSideBarMenus')
  async getSideBarMenus() {
    const data = await this.profileService.getSideBarMenus();
    return {
      code: 200,
      msg: '获取成功',
      data,
      logdata: { count: data.length },
    };
  }
}
