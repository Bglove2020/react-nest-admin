import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { LoggingService } from '@/common/logging/logging.service';
import type { UserInfo, SideBarItem, UserRouterItem } from '@ruoyi/contracts';

@Controller()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly loggingService: LoggingService,
  ) {}

  @Get('getInfo')
  async getInfo(): Promise<{ code: number; msg: string; data: UserInfo }> {
    this.loggingService.log('GET /getInfo');
    const data = await this.profileService.getInfo();
    this.loggingService.log('GET /getInfo success', {
      responseDescriptor: { data: data },
    });
    return { code: 200, msg: '获取成功', data };
  }

  @Get('getRouters')
  async getRouters(): Promise<{
    code: number;
    msg: string;
    data: UserRouterItem[];
  }> {
    this.loggingService.log('GET /getRouters');
    const data = await this.profileService.getRouters();
    this.loggingService.log('GET /getRouters success', {
      responseDescriptor: { type: 'list', data: data },
    });
    return { code: 200, msg: '获取成功', data };
  }

  @Get('getSideBarMenus')
  async getSideBarMenus(): Promise<{
    code: number;
    msg: string;
    data: SideBarItem[];
  }> {
    this.loggingService.log('GET /getSideBarMenus');
    const data = await this.profileService.getSideBarMenus();
    this.loggingService.log('GET /getSideBarMenus success', {
      responseDescriptor: { type: 'list', data: data },
    });
    return { code: 200, msg: '获取成功', data };
  }
}
