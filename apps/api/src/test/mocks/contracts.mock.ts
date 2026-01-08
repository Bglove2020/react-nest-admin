// Mock for @ruoyi/contracts package
export const loginSchema = {
  parse: jest.fn((data: unknown) => data),
  safeParse: jest.fn((data: unknown) => ({ success: true, data })),
};

export const registerSchema = {
  parse: jest.fn((data: unknown) => data),
  safeParse: jest.fn((data: unknown) => ({ success: true, data })),
};

export const createUserSchema = {
  parse: jest.fn((data: unknown) => data),
  safeParse: jest.fn((data: unknown) => ({ success: true, data })),
};

export const updateUserSchema = {
  parse: jest.fn((data: unknown) => data),
  safeParse: jest.fn((data: unknown) => ({ success: true, data })),
};

export const createUserDtoSchema = {
  parse: jest.fn((data: unknown) => data),
  safeParse: jest.fn((data: unknown) => ({ success: true, data })),
};

export const updateUserDtoSchema = {
  parse: jest.fn((data: unknown) => data),
  safeParse: jest.fn((data: unknown) => ({ success: true, data })),
};

export type FrontendDept = any;
export type FrontendMenu = any;
export type FrontendMenuBase = any;
