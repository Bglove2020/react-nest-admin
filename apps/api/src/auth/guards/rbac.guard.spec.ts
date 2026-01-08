import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGuard } from './rbac.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMS_KEY } from '../decorators/perms.decorator';

describe('RbacGuard', () => {
  let guard: RbacGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockExecutionContext = (user?: any, handlerDecorators: any = {}, controllerDecorators: any = {}): ExecutionContext => {
    const handler = function () {};
    const controller = class {};

    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module = {
      providers: [
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    };

    reflector = mockReflector as jest.Mocked<Reflector>;
    guard = new RbacGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('public routes', () => {
    it('should allow access to public routes', () => {
      const context = mockExecutionContext();

      reflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', expect.anything());
    });
  });

  describe('no authentication requirements', () => {
    it('should allow access when no roles or permissions required', () => {
      const user = { id: '1', roleKeys: ['user'], permissions: [] };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockReturnValue(false);
      reflector.getAllAndOverride.mockReturnValue([]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not authenticated and auth is required', () => {
      const context = mockExecutionContext(undefined);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['admin']; // requires role, so auth is needed
        if (key === PERMS_KEY) return [];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('role-based access control', () => {
    it('should allow access when user has required role', () => {
      const user = { id: '1', roleKeys: ['admin', 'user'], permissions: [] };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['admin'];
        if (key === PERMS_KEY) return [];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of the required roles', () => {
      const user = { id: '1', roleKeys: ['user'], permissions: [] };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['admin', 'user'];
        if (key === PERMS_KEY) return [];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when non-admin user lacks required role', () => {
      const user = { id: '1', roleKeys: ['guest'], permissions: [] };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['admin'];
        if (key === PERMS_KEY) return [];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access for admin role', () => {
      const user = { id: '1', roleKeys: ['admin'], permissions: [] };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['superadmin'];
        if (key === PERMS_KEY) return ['some:perm'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('permission-based access control', () => {
    it('should allow access when user has all required permissions', () => {
      const user = {
        id: '1',
        roleKeys: [],
        permissions: ['user:create', 'user:read'],
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return [];
        if (key === PERMS_KEY) return ['user:create', 'user:read'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user lacks required permission', () => {
      const user = {
        id: '1',
        roleKeys: [],
        permissions: ['user:read'],
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return [];
        if (key === PERMS_KEY) return ['user:create', 'user:read'];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access with wildcard permission', () => {
      const user = {
        id: '1',
        roleKeys: [],
        permissions: ['*:*:*'],
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return [];
        if (key === PERMS_KEY) return ['any:permission:here'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('combined role and permission checks', () => {
    it('should allow access when user has required role and permission', () => {
      const user = {
        id: '1',
        roleKeys: ['admin'],
        permissions: ['user:create'],
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['admin'];
        if (key === PERMS_KEY) return ['user:create'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when non-admin user has role but lacks permission', () => {
      const user = {
        id: '1',
        roleKeys: ['user'],
        permissions: ['user:read'],
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['user'];
        if (key === PERMS_KEY) return ['user:create'];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('admin user', () => {
    it('should allow access for admin user regardless of permissions', () => {
      const user = {
        id: '1',
        isAdmin: true,
        roleKeys: [],
        permissions: [],
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['superadmin'];
        if (key === PERMS_KEY) return ['any:permission'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle user with empty roleKeys array', () => {
      const user = {
        id: '1',
        roleKeys: [],
        permissions: [],
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return [];
        if (key === PERMS_KEY) return [];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle user with non-array roleKeys', () => {
      const user = {
        id: '1',
        roleKeys: null as any,
        permissions: [],
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return ['admin'];
        if (key === PERMS_KEY) return [];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle user with non-array permissions', () => {
      const user = {
        id: '1',
        roleKeys: [],
        permissions: null as any,
      };
      const context = mockExecutionContext(user);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === 'isPublic') return false;
        if (key === ROLES_KEY) return [];
        if (key === PERMS_KEY) return ['user:create'];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
