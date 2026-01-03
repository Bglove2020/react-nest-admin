import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { pageParamsSchema, sortParamsSchema } from '@ruoyi/contracts';

const dictDataListFilterSchema = pageParamsSchema
  .merge(sortParamsSchema)
  .extend({
    label: z.string().optional().describe('字典标签（模糊搜索）'),
    status: z.enum(['0', '1']).optional().describe('状态'),
  });

export class DictDataListDto extends createZodDto(dictDataListFilterSchema) {}
