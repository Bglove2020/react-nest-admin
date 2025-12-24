import { z } from "zod";

export const frontendUserSchema = z.object({
  publicId: z.string(),
  account: z.string(),
  name: z.string(),
  email: z.string(),
  sex: z.string(),
  avatar: z.string(),
  status: z.string(),
  deptPublicId: z.string(),
  deptName: z.string(),
  rolePublicIds: z.array(z.string()),
});

export const frontendRoleSchema = z.object({
  publicId: z.string(),
  name: z.string(),
  roleKey: z.string(),
  sortOrder: z.number(),
  status: z.string(),
  menuIds: z.array(z.string()),
});

export const frontendDeptSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    publicId: z.string(),
    name: z.string(),
    sortOrder: z.number(),
    leaderPublicId: z.string().optional(),
    leaderName: z.string().optional(),
    leaderEmail: z.string().optional(),
    status: z.string(),
    children: z.array(frontendDeptSchema as z.ZodType<any>),
  })
);

export type FrontendMenuBase = {
  publicId: string;
  name: string;
  sortOrder: number;
  path: string | null;
  isFrame: string;
  menuType: string;
  visible: string;
  status: string;
  perms: string | null;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  remark: string | null;
};

export type FrontendMenu = FrontendMenuBase & {
  children: FrontendMenu[];
};

export const frontendMenuSchema: z.ZodType<FrontendMenu> = z.lazy(() =>
  z.object({
    publicId: z.string(),
    name: z.string(),
    sortOrder: z.number(),
    path: z.string().nullable(),
    isFrame: z.string(),
    menuType: z.string(),
    visible: z.string(),
    status: z.string(),
    perms: z.string().nullable(),
    createBy: z.string(),
    createTime: z.string(),
    updateBy: z.string(),
    updateTime: z.string(),
    remark: z.string().nullable(),
    children: z.array(frontendMenuSchema),
  })
);

export const frontendDictTypeSchema = z.object({
  publicId: z.string(),
  name: z.string(),
  type: z.string(),
  sortOrder: z.number(),
  status: z.string(),
  createTime: z.string().optional(),
  updateTime: z.string().optional(),
});

export const frontendDictDataSchema = z.object({
  publicId: z.string(),
  label: z.string(),
  value: z.string(),
  sortOrder: z.number(),
  status: z.string(),
  cssClass: z.string().optional(),
  listClass: z.string().optional(),
});

export type FrontendUser = z.infer<typeof frontendUserSchema>;
export type FrontendRole = z.infer<typeof frontendRoleSchema>;
export type FrontendDept = z.infer<typeof frontendDeptSchema>;
// export type FrontendMenu = z.infer<typeof frontendMenuSchema>;
export type FrontendDictType = z.infer<typeof frontendDictTypeSchema>;
export type FrontendDictData = z.infer<typeof frontendDictDataSchema>;
