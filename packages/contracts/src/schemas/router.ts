import { z } from "zod";

export const routerItemSchema = z.object({
  name: z.string(),
  path: z.string(),
});

export type RouterItem = z.infer<typeof routerItemSchema>;
