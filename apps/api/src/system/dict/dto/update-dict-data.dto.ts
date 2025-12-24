import { createZodDto } from "nestjs-zod";
import { dictDataUpdateSchema } from "@ruoyi/contracts";

export class UpdateDictDataDto extends createZodDto(dictDataUpdateSchema) {}
