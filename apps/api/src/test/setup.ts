// Global test setup file

// Mock @ruoyi/contracts package
jest.mock('@ruoyi/contracts', () => ({
  loginSchema: {
    parse: jest.fn(),
    safeParse: jest.fn(),
  },
  registerSchema: {
    parse: jest.fn(),
    safeParse: jest.fn(),
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
  genSalt: jest.fn().mockResolvedValue(10),
}));

// Mock ioredis Redis
jest.mock('ioredis', () => {
  const mockRedis = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    scan: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    exists: jest.fn().mockResolvedValue(0),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };

  return {
    Redis: jest.fn(() => mockRedis),
  };
});

// Mock typeorm-transactional to bypass transactional decorator in tests
jest.mock('typeorm-transactional', () => ({
  Transactional: () => (target: any, key: string, descriptor: PropertyDescriptor) => descriptor,
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
  getDataSourceByName: jest.fn(),
}));

