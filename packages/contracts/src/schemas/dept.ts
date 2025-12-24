import { z } from "zod";
import {
  nameSchema,
  optionalPublicIdSchema,
  publicIdSchema,
  sortOrderSchema,
  statusSchema,
} from "./common";

export const deptCreateSchema = z.object({
  name: nameSchema,
  parentPublicId: optionalPublicIdSchema,
  sortOrder: sortOrderSchema,
  leaderPublicId: optionalPublicIdSchema,
  status: statusSchema,
});

export const deptUpdateSchema = z.object({
  publicId: publicIdSchema,
  name: nameSchema,
  sortOrder: sortOrderSchema,
  leaderPublicId: optionalPublicIdSchema,
  status: statusSchema,
});

export type DeptCreatePayload = z.infer<typeof deptCreateSchema>;
export type DeptUpdatePayload = z.infer<typeof deptUpdateSchema>;
