import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '@/system/user/user.service';
import { AlsService } from '@/common/als/als.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let accessJwtService: jest.Mocked<JwtService>;
  let refreshJwtService: jest.Mocked<JwtService>;
  let alsService: jest.Mocked<AlsService>;

  const mockUser = {
    id: '1',
    account: 'testuser',
    password: '$2a$10$hashedpassword',
    name: 'Test User',
    email: 'test@example.com',
    roles: [
      { id: '1', roleKey: 'admin', name: 'Admin' },
      { id: '2', roleKey: 'user', name: 'User' },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            getByAccount: jest.fn(),
          },
        },
        {
          provide: 'ACCESS_JWT',
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: 'REFRESH_JWT',
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: AlsService,
          useValue: {
            updateContext: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    accessJwtService = module.get('ACCESS_JWT');
    refreshJwtService = module.get('REFRESH_JWT');
    alsService = module.get(AlsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('register', () => {
    it('should call userService.create with registerDto', async () => {
      const registerDto = {
        account: 'newuser',
        password: 'password123',
        name: 'New User',
        email: 'new@example.com',
      };

      userService.create.mockResolvedValue(undefined);
      await service.register(registerDto);

      expect(userService.create).toHaveBeenCalledWith(registerDto);
    });
  });
  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const userAccount = 'testuser';
      const password = 'password123';

      userService.getByAccount.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(userAccount, password);

      expect(result).toBeDefined();
      expect(result?.password).toBeUndefined();
      expect(result?.id).toBe(mockUser.id);
      expect(result?.account).toBe(mockUser.account);
    });

    it('should return null if user does not exist', async () => {
      userService.getByAccount.mockResolvedValue(null);
      const result = await service.validateUser('nonexistent', 'password');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      userService.getByAccount.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });
  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto = { account: 'testuser', password: 'password123' };

      jest.spyOn(service, 'validateUser').mockResolvedValue({
        id: '1',
        account: 'testuser',
        roles: [{ roleKey: 'admin' }, { roleKey: 'user' }],
      } as any);

      accessJwtService.signAsync.mockResolvedValue('access-token');
      refreshJwtService.signAsync.mockResolvedValue('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const loginDto = { account: 'testuser', password: 'wrongpassword' };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new BadRequestException({ msg: '用户名或密码错误', code: 400 }),
      );
    });

    it('should handle user without roles', async () => {
      const loginDto = { account: 'testuser', password: 'password123' };

      jest.spyOn(service, 'validateUser').mockResolvedValue({
        id: '1',
        account: 'testuser',
        roles: null,
      } as any);

      accessJwtService.signAsync.mockResolvedValue('access-token');
      refreshJwtService.signAsync.mockResolvedValue('refresh-token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('access-token');
    });

    it('should filter out null/undefined role keys', async () => {
      const loginDto = { account: 'testuser', password: 'password123' };

      jest.spyOn(service, 'validateUser').mockResolvedValue({
        id: '1',
        account: 'testuser',
        roles: [{ roleKey: 'admin' }, { roleKey: null }, {}, { roleKey: 'user' }],
      } as any);

      accessJwtService.signAsync.mockResolvedValue('access-token');
      refreshJwtService.signAsync.mockResolvedValue('refresh-token');

      await service.login(loginDto);

      expect(accessJwtService.signAsync).toHaveBeenCalledWith({
        userAccount: 'testuser',
        sub: '1',
        roleKeys: ['admin', 'user'],
      });
    });
  });
  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        userAccount: 'testuser',
        sub: '1',
        roleKeys: ['admin', 'user'],
      };

      refreshJwtService.verifyAsync.mockResolvedValue(payload);
      accessJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refresh(refreshToken);

      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      refreshJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException({ msg: '刷新令牌无效', code: 401 }),
      );
    });

    it('should handle empty role keys in payload', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        userAccount: 'testuser',
        sub: '1',
        roleKeys: [],
      };

      refreshJwtService.verifyAsync.mockResolvedValue(payload);
      accessJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refresh(refreshToken);

      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should handle missing role keys in payload', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        userAccount: 'testuser',
        sub: '1',
      };

      refreshJwtService.verifyAsync.mockResolvedValue(payload);
      accessJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refresh(refreshToken);

      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should filter null values from role keys', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        userAccount: 'testuser',
        sub: '1',
        roleKeys: ['admin', null, undefined, 'user'],
      };

      refreshJwtService.verifyAsync.mockResolvedValue(payload);
      accessJwtService.signAsync.mockResolvedValue('new-access-token');

      await service.refresh(refreshToken);

      expect(accessJwtService.signAsync).toHaveBeenCalledWith({
        userAccount: 'testuser',
        sub: '1',
        roleKeys: ['admin', 'user'],
      });
    });
  });
});
