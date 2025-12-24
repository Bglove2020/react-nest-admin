import { createZodDto } from "nestjs-zod";
import { deptUpdateSchema } from "@ruoyi/contracts";

export class UpdateDeptDto extends createZodDto(deptUpdateSchema) {}
