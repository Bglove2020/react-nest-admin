import { createZodDto } from 'nestjs-zod';
import { loginSchema } from '@ruoyi/contracts';

export class LoginDto extends createZodDto(loginSchema) {}
