import { z } from 'zod';
import {
  optionalPublicIdSchema,
  publicIdSchema,
  sortOrderSchema,
  statusSchema,
} from '@ruoyi/contracts';

const isFrameSchema = z.enum(['0', '1']);
const visibleSchema = z.enum(['0', '1']);

const baseMenuSchema = z.object({
  menuType: z.enum(['M', 'C', 'F']),
  name: z.string().min(1, '请输入菜单名称'),
  sortOrder: sortOrderSchema,
  status: statusSchema,
  parentPublicId: optionalPublicIdSchema.optional(),
  perms: z.string().optional(),
  isFrame: isFrameSchema.optional(),
  visible: visibleSchema.optional(),
  path: z.string().optional(),
});

function refineMenuSchema(
  data: z.infer<typeof baseMenuSchema>,
  ctx: z.RefinementCtx,
) {
  const isEmpty = (value?: string) => !value || value.trim() === '';

  if (data.menuType === 'M') {
    if (!data.isFrame) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '\u76ee\u5f55\u7c7b\u578b\u5fc5\u987b\u9009\u62e9\u662f\u5426\u5916\u94fe',
        path: ['isFrame'],
      });
    }
    if (!data.visible) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '\u76ee\u5f55\u7c7b\u578b\u5fc5\u987b\u9009\u62e9\u662f\u5426\u663e\u793a',
        path: ['visible'],
      });
    }
    if (data.isFrame === '1' && isEmpty(data.path)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '\u5916\u94fe\u76ee\u5f55\u5fc5\u987b\u586b\u5199\u8def\u5f84',
        path: ['path'],
      });
    }
    return;
  }

  if (data.menuType === 'C') {
    if (isEmpty(data.perms)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '\u83dc\u5355\u7c7b\u578b\u5fc5\u987b\u586b\u5199\u6743\u9650\u6807\u8bc6',
        path: ['perms'],
      });
    }
    if (!data.isFrame) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '\u83dc\u5355\u7c7b\u578b\u5fc5\u987b\u9009\u62e9\u662f\u5426\u5916\u94fe',
        path: ['isFrame'],
      });
    }
    if (!data.visible) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '\u83dc\u5355\u7c7b\u578b\u5fc5\u987b\u9009\u62e9\u662f\u5426\u663e\u793a',
        path: ['visible'],
      });
    }
    if (isEmpty(data.path)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '\u83dc\u5355\u7c7b\u578b\u5fc5\u987b\u586b\u5199\u8def\u5f84',
        path: ['path'],
      });
    }
    return;
  }

  if (data.menuType === 'F') {
    if (isEmpty(data.perms)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '\u6309\u94ae\u7c7b\u578b\u5fc5\u987b\u586b\u5199\u6743\u9650\u6807\u8bc6',
        path: ['perms'],
      });
    }
  }
}

export const menuCreateDtoSchema = baseMenuSchema.superRefine(refineMenuSchema);

export const menuUpdateDtoSchema = baseMenuSchema
  .extend({ publicId: publicIdSchema })
  .superRefine(refineMenuSchema);
