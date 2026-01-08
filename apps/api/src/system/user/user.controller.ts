import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCode, type ApiResponse, type PaginatedResponse } from '@ruoyi/contracts';
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
  async list(@Query() query: UserListDto): Promise<PaginatedResponse<FrontendUser>> {
    const { list, total } = await this.userService.list(query);
    return {
      code: ApiCode.SUCCESS,
      msg: '用户列表获取成功',
      data: {
        list: toFrontendListDtos(list),
        total,
      },
    };
  }

  @RequirePerms('system:user:add')
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<null>> {
    await this.userService.create(createUserDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '用户创建成功',
      data: null,
    };
  }

  @RequirePerms('system:user:query')
  @Get('get/:id')
  async get(@Param('id') id: string): Promise<ApiResponse<FrontendUser | null>> {
    const user = await this.userService.get(id);
    if (user) {
      const frontendUser = toFrontendDto(user);
      return {
        code: ApiCode.SUCCESS,
        msg: '用户获取成功',
        data: frontendUser,
      };
    }
    return {
      code: ApiCode.NOT_FOUND,
      msg: '用户不存在',
      data: null,
    };
  }

  @Public()
  @Get('checkUserAccount')
  async getByAccount(
    @Query('account') account: string,
  ): Promise<ApiResponse<{ available: boolean }>> {
    const user = await this.userService.getByAccount(account);
    if (user) {
      return {
        code: ApiCode.SUCCESS,
        msg: '账号已存在',
        data: { available: false },
      };
    }
    return {
      code: ApiCode.SUCCESS,
      msg: '账号可用',
      data: { available: true },
    };
  }

  @RequirePerms('system:user:resetPwd')
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetUserPasswordDto,
  ): Promise<ApiResponse<null>> {
    await this.userService.resetPassword(resetPasswordDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '密码重置成功',
      data: null,
    };
  }

  @RequirePerms('system:user:edit')
  @Post('update')
  async update(@Body() updateUserDto: UpdateUserDto): Promise<ApiResponse<null>> {
    await this.userService.update(updateUserDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '用户更新成功',
      data: null,
    };
  }

  @RequirePerms('system:user:remove')
  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.userService.delete(id);
    return {
      code: ApiCode.SUCCESS,
      msg: '用户删除成功',
      data: null,
    };
  }
}
