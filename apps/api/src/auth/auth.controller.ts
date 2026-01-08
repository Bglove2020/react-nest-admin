import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiCode, type ApiResponse } from '@ruoyi/contracts';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.register(registerDto);
    return {
      code: ApiCode.SUCCESS,
      msg: '注册成功',
      data: null,
    };
  }

  @Public()
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('refresh_token', `Bearer ${refreshToken}`, {
      httpOnly: true,
      path: 'api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    });

    return {
      code: ApiCode.SUCCESS,
      msg: '登录成功',
      data: { accessToken },
    };
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    res.setHeader('Set-Cookie', 'refresh_token=; HttpOnly; Path=/; Max-Age=0');
    return {
      code: ApiCode.SUCCESS,
      msg: '退出成功',
      data: null,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request): Promise<ApiResponse<{ accessToken: string }>> {
    const refreshToken = req.cookies['refresh_token']?.replace('Bearer ', '');
    if (!refreshToken) {
      throw new UnauthorizedException({
        msg: '刷新令牌无效',
        code: ApiCode.UNAUTHORIZED,
      });
    }
    const result = await this.authService.refresh(refreshToken);
    return {
      code: ApiCode.SUCCESS,
      msg: '刷新令牌成功',
      data: result,
    };
  }
}
