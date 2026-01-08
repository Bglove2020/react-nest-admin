import { Controller, Get } from '@nestjs/common';
import { ApiCode, type ApiResponse } from '@ruoyi/contracts';
import type { UserInfo, SideBarItem, UserRouterItem } from '@ruoyi/contracts';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('getInfo')
  async getInfo(): Promise<ApiResponse<UserInfo>> {
    const data = await this.profileService.getInfo();
    return {
      code: ApiCode.SUCCESS,
      msg: '获取成功',
      data,
    };
  }

  @Get('getRouters')
  async getRouters(): Promise<ApiResponse<UserRouterItem[]>> {
    const data = await this.profileService.getRouters();
    return {
      code: ApiCode.SUCCESS,
      msg: '获取成功',
      data,
    };
  }

  @Get('getSideBarMenus')
  async getSideBarMenus(): Promise<ApiResponse<SideBarItem[]>> {
    const data = await this.profileService.getSideBarMenus();
    return {
      code: ApiCode.SUCCESS,
      msg: '获取成功',
      data,
    };
  }
}
