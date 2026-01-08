/**
 * Mock factory for TypeORM Repository
 */
export const createMockRepository = <T>() => ({
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  findBy: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softRemove: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  count: jest.fn(),
  query: jest.fn(),
  clear: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    execute: jest.fn(),
  })),
});

/**
 * Mock factory for JwtService
 */
export const createMockJwtService = () => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
});

/**
 * Mock factory for RedisService
 */
export const createMockRedisService = () => ({
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  delByPattern: jest.fn(),
  exists: jest.fn(),
  keys: jest.fn(),
  getClient: jest.fn(),
});

/**
 * Mock factory for AlsService
 */
export const createMockAlsService = () => ({
  run: jest.fn(),
  getStore: jest.fn(),
  getRequestId: jest.fn(),
  getUserId: jest.fn(),
  updateContext: jest.fn(),
});

/**
 * Mock factory for ConfigService
 */
export const createMockConfigService = () => ({
  get: jest.fn(),
  getOrThrow: jest.fn(),
});

/**
 * Mock factory for Reflector
 */
export const createMockReflector = () => ({
  get: jest.fn(),
  getAllAndOverride: jest.fn(),
  getAllAndMerge: jest.fn(),
});

/**
 * Mock factory for LoggingService
 */
export const createMockLoggingService = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});
