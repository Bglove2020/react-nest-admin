import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggingService } from '@/common/logging/logging.service';

// controller测试范围与边界：
// 1. 测试输出数据，不测试输入数据：因为controller的数据是mock的，所以不测试输入数据
// 2. 测试有没有正确调用对应的service层，并传入正确的数据：因为controler的主要职责是根据输入数据调用service层
describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockTokens = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('应该调用authService.register，并注册成功', async () => {
      const registerDto = {
        account: 'newuser',
        password: 'password123',
        name: 'New User',
        email: 'new@example.com',
      };

      authService.register.mockResolvedValue(undefined);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        code: 200,
        msg: '注册成功',
        data: null,
      });
    });
  });

  describe('login', () => {
    it('应该调用authService.login，并登录成功返回token和设置refresh_token cookie', async () => {
      const loginDto = {
        account: 'testuser',
        password: 'password123',
      };

      const mockReq = { ip: '127.0.0.1' };
      const mockRes = {
        cookie: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as Response;

      authService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(mockReq as any, mockRes, loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        `Bearer ${mockTokens.refreshToken}`,
        {
          httpOnly: true,
          path: 'api/auth/refresh',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );

      expect(result).toEqual({
        code: 200,
        msg: '登录成功',
        data: { accessToken: mockTokens.accessToken },
      });
    });
  });

  describe('logout', () => {
    it('应该无需调用service层，设置refresh_token cookie为空，并退出成功', async () => {
      const mockRes = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        'refresh_token=; HttpOnly; Path=/; Max-Age=0',
      );
      expect(result).toEqual({
        code: 200,
        msg: '退出成功',
        data: null,
      });
    });
  });

  describe('refresh', () => {
    it('应该调用authService.refresh，并刷新令牌成功', async () => {
      const mockReq = {
        cookies: {
          refresh_token: 'Bearer test-refresh-token',
        },
      };

      const newTokens = {
        accessToken: 'new-access-token',
      };

      authService.refresh.mockResolvedValue(newTokens);

      const result = await controller.refresh(mockReq as any);

      expect(authService.refresh).toHaveBeenCalledWith('test-refresh-token');
      expect(result).toEqual({
        code: 200,
        msg: '刷新令牌成功',
        data: newTokens,
      });
    });

    it('应该在无令牌时，返回401错误', async () => {
      const mockReq = {
        cookies: {},
      };

      const newTokens = {
        accessToken: 'new-access-token',
      };

      authService.refresh.mockResolvedValue(newTokens);

      const result = await controller.refresh(mockReq as any);

      expect(authService.refresh).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        code: 200,
        msg: '刷新令牌成功',
        data: newTokens,
      });
    });
  });
});
