import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListDto } from './dto/user-list.dto';
import { Public } from '@/auth/public.decorator';
import { RequirePerms } from '@/auth/decorators/perms.decorator';
import type { FrontendUser } from '@ruoyi/contracts';
import { toFrontendDto, toFrontendListDtos } from './mapper/user.mapper';

@Controller('/system/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RequirePerms('system:user:list')
  @Get('list')
  async list(@Query() query: UserListDto) {
    const { list, total } = await this.userService.list(query);
    return {
      code: 200,
      msg: '用户列表获取成功',
      data: {
        list: toFrontendListDtos(list),
        total,
      },
      logdata: { count: list.length, total },
    };
  }

  @RequirePerms('system:user:add')
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto);
    return {
      code: 200,
      msg: '用户创建成功',
      data: null,
      logdata: { account: createUserDto.account },
    };
  }

  @RequirePerms('system:user:query')
  @Get('get/:id')
  async get(@Param('id') id: string) {
    const user = await this.userService.get(id);
    if (user) {
      const frontendUser = toFrontendDto(user);
      return {
        code: 200,
        msg: '用户获取成功',
        data: frontendUser,
        logdata: { id: frontendUser.id, account: frontendUser.account },
      };
    } else {
      return {
        code: 404,
        msg: '用户不存在',
        data: null,
        logdata: { found: false, id },
      };
    }
  }

  @Public()
  @Get('checkUserAccount')
  async getByAccount(@Query('account') account: string) {
    const user = await this.userService.getByAccount(account);
    if (user) {
      return {
        code: 200,
        msg: '账号已存在',
        data: { available: false },
        logdata: { account, available: false },
      };
    }
    return {
      code: 200,
      msg: '账号可用',
      data: { available: true },
      logdata: { account, available: true },
    };
  }

  @RequirePerms('system:user:resetPwd')
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetUserPasswordDto) {
    await this.userService.resetPassword(resetPasswordDto);
    return {
      code: 200,
      msg: '密码重置成功',
      data: null,
      logdata: { userId: resetPasswordDto.id },
    };
  }

  @RequirePerms('system:user:edit')
  @Post('update')
  async update(@Body() updateUserDto: UpdateUserDto) {
    await this.userService.update(updateUserDto);
    return {
      code: 200,
      msg: '用户更新成功',
      data: null,
      logdata: { userId: updateUserDto.id },
    };
  }

  @RequirePerms('system:user:remove')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    await this.userService.delete(id);
    return {
      code: 200,
      msg: '用户删除成功',
      data: null,
      logdata: { userId: id },
    };
  }
}
