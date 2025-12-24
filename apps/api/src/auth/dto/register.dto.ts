import { createZodDto } from 'nestjs-zod';
import { registerBackendSchema } from '@ruoyi/contracts';

export class RegisterDto extends createZodDto(registerBackendSchema) {}
