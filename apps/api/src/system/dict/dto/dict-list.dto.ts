import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { pageParamsSchema, sortParamsSchema } from '@ruoyi/contracts';

const dictListFilterSchema = pageParamsSchema
  .merge(sortParamsSchema)
  .extend({
    name: z.string().optional().describe('字典名称（模糊搜索）'),
    type: z.string().optional().describe('字典类型（模糊搜索）'),
    status: z.enum(['0', '1']).optional().describe('状态'),
  });

export class DictListDto extends createZodDto(dictListFilterSchema) {}
