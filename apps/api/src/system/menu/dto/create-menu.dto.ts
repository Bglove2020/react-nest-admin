import { createZodDto } from 'nestjs-zod';
import { menuCreateDtoSchema } from './menu.schema';

export class CreateMenuDto extends createZodDto(
  menuCreateDtoSchema,
) {}
