import { createZodDto } from 'nestjs-zod';
import { menuUpdateDtoSchema } from './menu.schema';

export class UpdateMenuDto extends createZodDto(
  menuUpdateDtoSchema,
) {}
