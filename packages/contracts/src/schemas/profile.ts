import { z } from "zod";

export const userInfoSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    account: z.string(),
    email: z.string(),
    avatar: z.string(),
    sex: z.string(),
    status: z.string(),
  }),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});
export type UserInfo = z.infer<typeof userInfoSchema>;

export type SideBarItem = {
  title: string;
  url: string | null;
  hidden: boolean;
  frame: boolean;
  children: SideBarItem[];
};
export const sideBarItemSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    title: z.string(),
    url: z.string().nullable(),
    hidden: z.boolean(),
    frame: z.boolean(),
    children: z.array(sideBarItemSchema as z.ZodType<any>).optional(),
  })
);

export const userRouterItemSchema = z.object({
  name: z.string(),
  path: z.string(),
});
export type UserRouterItem = z.infer<typeof userRouterItemSchema>;
