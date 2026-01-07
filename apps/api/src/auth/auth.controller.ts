import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return {
      code: 200,
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
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('refresh_token', `Bearer ${refreshToken}`, {
      httpOnly: true,
      path: 'api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    });

    return {
      code: 200,
      msg: '登录成功',
      data: { accessToken },
      logdata: { account: loginDto.account, loginSuccess: true },
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Set-Cookie', 'refresh_token=; HttpOnly; Path=/; Max-Age=0');
    return {
      code: 200,
      msg: '退出成功',
      data: null,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token']?.replace('Bearer ', '');
    if (!refreshToken) {
      throw new UnauthorizedException({ msg: '刷新令牌无效', code: 401 });
    }
    const result = await this.authService.refresh(refreshToken);
    return {
      code: 200,
      msg: '刷新令牌成功',
      data: result,
      logdata: { refreshSuccess: true },
    };
  }
}
