import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { pageParamsSchema, sortParamsSchema } from '@ruoyi/contracts';

const roleListFilterSchema = pageParamsSchema
  .merge(sortParamsSchema)
  .extend({
    name: z.string().optional().describe('角色名称（模糊搜索）'),
    roleKey: z.string().optional().describe('权限字符（模糊搜索）'),
    status: z.enum(['0', '1']).optional().describe('状态'),
  });

export class RoleListDto extends createZodDto(roleListFilterSchema) {}
