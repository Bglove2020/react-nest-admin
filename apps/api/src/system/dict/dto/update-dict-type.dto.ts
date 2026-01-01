import { createZodDto } from 'nestjs-zod';
import { dictTypeUpdateSchema } from '@ruoyi/contracts';

export class UpdateDictTypeDto extends createZodDto(dictTypeUpdateSchema) {}
