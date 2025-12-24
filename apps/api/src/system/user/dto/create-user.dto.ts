import { createZodDto } from "nestjs-zod";
import { userCreateSchema } from "@ruoyi/contracts";

export class CreateUserDto extends createZodDto(userCreateSchema) {}
