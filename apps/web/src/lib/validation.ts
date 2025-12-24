import {
  accountSchema,
  nameSchema,
  passwordComplexRegex,
  passwordSchema as basePasswordSchema,
} from "@ruoyi/contracts";

export { passwordComplexRegex };

export function userAccountSchema() {
  return accountSchema;
}

export function userNameSchema() {
  return nameSchema;
}

export function passwordSchema() {
  return basePasswordSchema;
}
