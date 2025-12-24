import { createZodDto } from "nestjs-zod";
import { roleUpdateSchema } from "@ruoyi/contracts";

export class UpdateRoleDto extends createZodDto(roleUpdateSchema) {}
