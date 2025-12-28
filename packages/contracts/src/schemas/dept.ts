import { z } from "zod";
import {
  nameSchema,
  optionalIdSchema,
  idSchema,
  sortOrderSchema,
  statusSchema,
} from "./common";

export const deptCreateSchema = z.object({
  name: nameSchema,
  parentId: optionalIdSchema,
  sortOrder: sortOrderSchema,
  leaderId: optionalIdSchema,
  status: statusSchema,
});

export const deptUpdateSchema = z.object({
  id: idSchema,
  name: nameSchema,
  sortOrder: sortOrderSchema,
  leaderId: optionalIdSchema,
  status: statusSchema,
});

export type DeptCreatePayload = z.infer<typeof deptCreateSchema>;
export type DeptUpdatePayload = z.infer<typeof deptUpdateSchema>;
