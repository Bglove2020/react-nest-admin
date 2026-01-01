import { createZodDto } from 'nestjs-zod';
import { menuCreateSchema } from '@ruoyi/contracts';

export class CreateMenuDto extends createZodDto(menuCreateSchema) {}
