import { createZodDto } from 'nestjs-zod';
import { registerSchema } from '@ruoyi/contracts';

export class RegisterDto extends createZodDto(registerSchema) {}
