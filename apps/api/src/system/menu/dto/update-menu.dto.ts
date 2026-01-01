import { createZodDto } from 'nestjs-zod';
import { menuUpdateSchema } from '@ruoyi/contracts';

export class UpdateMenuDto extends createZodDto(menuUpdateSchema) {}
