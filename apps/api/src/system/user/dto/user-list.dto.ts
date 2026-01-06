import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { pageParamsSchema, sortParamsSchema } from '@ruoyi/contracts';

const userListFilterSchema = pageParamsSchema.merge(sortParamsSchema).extend({
  account: z.string().optional().describe('账号（模糊搜索）'),
  sex: z.enum(['0', '1', '2']).optional().describe('性别'),
  status: z
    .preprocess(
      (val) => (typeof val === 'string' ? [val] : val),
      z.array(z.enum(['0', '1'])),
    )
    .optional()
    .describe('状态（多选）'),
});

export class UserListDto extends createZodDto(userListFilterSchema) {}
