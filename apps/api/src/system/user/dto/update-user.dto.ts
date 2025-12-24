import { createZodDto } from "nestjs-zod";
import { userUpdateSchema } from "@ruoyi/contracts";

export class UpdateUserDto extends createZodDto(userUpdateSchema) {}
