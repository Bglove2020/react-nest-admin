import { z } from "zod";

export const treeNodeSchema = z.object({
  publicId: z.string(),
  name: z.string(),
  children: z.array(z.any()).optional(),
});

export interface DeptNode {
  publicId: string;
  name: string;
  sortOrder: number;
  leaderPublicId?: string;
  leaderName?: string;
  leaderEmail?: string;
  status: string;
  children: DeptNode[];
}

export const deptNodeSchema: z.ZodType<DeptNode> = z.lazy(() =>
  z.object({
    publicId: z.string(),
    name: z.string(),
    sortOrder: z.number(),
    leaderPublicId: z.string().optional(),
    leaderName: z.string().optional(),
    leaderEmail: z.string().optional(),
    status: z.string(),
    children: z.array(deptNodeSchema),
  })
);

export interface MenuNode {
  publicId: string;
  name: string;
  sortOrder: number;
  path?: string;
  perms?: string;
  isFrame: "0" | "1";
  menuType: "M" | "C" | "F";
  visible: "0" | "1";
  status: "0" | "1";
  children: MenuNode[];
}

export const menuNodeSchema: z.ZodType<MenuNode> = z.lazy(() =>
  z.object({
    publicId: z.string(),
    name: z.string(),
    sortOrder: z.number(),
    path: z.string().optional(),
    perms: z.string().optional(),
    isFrame: z.enum(["0", "1"]),
    menuType: z.enum(["M", "C", "F"]),
    visible: z.enum(["0", "1"]),
    status: z.enum(["0", "1"]),
    children: z.array(menuNodeSchema),
  })
);

export type TreeNode = z.infer<typeof treeNodeSchema>;
