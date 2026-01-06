import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListDto } from './dto/user-list.dto';
import { LoggingService } from '@/common/logging/logging.service';
import { Public } from '@/auth/public.decorator';
import { RequirePerms } from '@/auth/decorators/perms.decorator';
import type { FrontendUser } from '@ruoyi/contracts';
import { toFrontendDto, toFrontendListDtos } from './mapper/user.mapper';

@Controller('/system/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  @RequirePerms('system:user:list')
  @Get('list')
  async list(
    @Query() query: UserListDto,
    @Req() req: any,
  ): Promise<{
    code: number;
    msg: string;
    data: {
      list: FrontendUser[];
      total: number;
    };
  }> {
    // --- 测试代码开始 ---
    console.log('=== [Express Raw Query] ===');
    console.log(req.query); // 这是 Express 经过 qs 解析后的原始对象

    console.log('=== [NestJS/Zod DTO Query] ===');
    console.log(query); // 这是经过 Zod 验证和转换后的 DTO 实例
    // --- 测试代码结束 ---
    this.loggingService.log('GET /system/user/list', {
      params: query,
    });
    const { list, total } = await this.userService.list(query);
    this.loggingService.log('GET /system/user/list success', {
      responseDescriptor: { type: 'list', count: list.length, total },
    });
    return {
      code: 200,
      msg: '用户列表获取成功',
      data: {
        list: toFrontendListDtos(list),
        total,
      },
    };
  }

  @RequirePerms('system:user:add')
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    this.loggingService.log('POST /system/user/create', {
      requestDescriptor: { data: createUserDto },
    });
    await this.userService.create(createUserDto);
    this.loggingService.log('POST /system/user/create success');
    return { code: 200, msg: '用户创建成功', data: null };
  }

  @RequirePerms('system:user:query')
  @Get('get/:id')
  async get(@Param('id') id: string) {
    this.loggingService.log('GET /system/user/get', {
      params: { id: id },
    });
    const user = await this.userService.get(id);
    if (user) {
      this.loggingService.log('GET /system/user/get success', {
        responseDescriptor: { data: toFrontendDto(user) },
      });
      return { code: 200, msg: '用户获取成功', data: toFrontendDto(user) };
    } else {
      this.loggingService.log('GET /system/user/get failed', {
        responseDescriptor: { data: null },
      });
      return { code: 404, msg: '用户不存在', data: null };
    }
  }

  @Public()
  @Get('checkUserAccount')
  async getByAccount(@Query('account') account: string) {
    this.loggingService.log('GET /system/user/checkUserAccount', {
      query: { account: account },
    });
    const user = await this.userService.getByAccount(account);
    if (user) {
      this.loggingService.log('GET /system/user/checkUserAccount success', {
        responseDescriptor: { data: { available: false, msg: '账号已存在' } },
      });
      return { code: 200, msg: '账号已存在', data: { available: false } };
    }
    this.loggingService.log('GET /system/user/checkUserAccount success', {
      responseDescriptor: { data: { available: true, msg: '账号可用' } },
    });
    return { code: 200, msg: '账号可用', data: { available: true } };
  }

  @RequirePerms('system:user:resetPwd')
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetUserPasswordDto) {
    this.loggingService.log('POST /system/user/resetPassword', {
      requestDescriptor: { data: resetPasswordDto },
    });
    await this.userService.resetPassword(resetPasswordDto);
    this.loggingService.log('POST /system/user/resetPassword success');
    return { code: 200, msg: '密码重置成功', data: null };
  }

  @RequirePerms('system:user:edit')
  @Post('update')
  async update(@Body() updateUserDto: UpdateUserDto) {
    this.loggingService.log('POST /system/user/update', {
      requestDescriptor: { data: updateUserDto },
    });
    await this.userService.update(updateUserDto);
    this.loggingService.log('POST /system/user/update success');
    return { code: 200, msg: '用户更新成功', data: null };
  }

  @RequirePerms('system:user:remove')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    this.loggingService.log('DELETE /system/user/delete', {
      params: { id: id },
    });
    await this.userService.delete(id);
    this.loggingService.log('DELETE /system/user/delete success');
    return { code: 200, msg: '用户删除成功', data: null };
  }
}
