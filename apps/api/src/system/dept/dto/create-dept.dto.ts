import { createZodDto } from 'nestjs-zod';
import { deptCreateSchema } from '@ruoyi/contracts';

export class CreateDeptDto extends createZodDto(deptCreateSchema) {}
