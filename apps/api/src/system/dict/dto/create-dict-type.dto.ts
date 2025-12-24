import { createZodDto } from "nestjs-zod";
import { dictTypeCreateSchema } from "@ruoyi/contracts";

export class CreateDictTypeDto extends createZodDto(dictTypeCreateSchema) {}
