import { createZodDto } from "nestjs-zod";
import { dictDataCreateSchema } from "@ruoyi/contracts";

export class CreateDictDataDto extends createZodDto(dictDataCreateSchema) {}
