import { createZodDto } from "nestjs-zod";
import { userResetPasswordSchema } from "@ruoyi/contracts";

export class ResetUserPasswordDto extends createZodDto(
  userResetPasswordSchema
) {}
