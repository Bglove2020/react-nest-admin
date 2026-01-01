import { createZodDto } from 'nestjs-zod';
import { roleCreateSchema } from '@ruoyi/contracts';

export class CreateRoleDto extends createZodDto(roleCreateSchema) {}
