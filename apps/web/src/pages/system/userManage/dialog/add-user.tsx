import { Button } from "@ruoyi/ui";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  userCreateSchema,
  userUpdateSchema,
  passwordSchema,
  passwordMismatchMessage,
} from "@ruoyi/contracts";
import { axiosClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MultiSelectDropdown } from "@/components/Select/multi-select-dropdown";

// 前端专用的用户创建表单 schema
// 基于 userCreateSchema 扩展，添加确认密码字段
const userCreateFormSchema = userCreateSchema.extend({
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: passwordMismatchMessage,
  path: ["confirmPassword"],
});

import { Field, FieldGroup, FieldLabel, FieldError } from "@ruoyi/ui";
import { useForm, Controller } from "react-hook-form";
import { HoverCardFormItem } from "@ruoyi/ui";
import { TreeSelect } from "@/components/Select/tree-select";

// 后端账号可用性校验（约定返回 { available: boolean }）
async function checkUserAccount(account: string) {
  try {
    const response = await axiosClient.get(
      `system/user/checkUserAccount?account=${account}`,
    );
    return response.data.data.available;
  } catch (error) {
    console.error("检查账号是否存在失败:", error);
    return false;
  }
}

// 防抖相关的变量
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// 带防抖的账号校验函数
async function checkUserAccountWithDebounce(
  account: string,
  delay: number = 500,
): Promise<boolean> {
  // 清除之前的定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      try {
        // 执行异步校验
        const isAvailable = await checkUserAccount(account);
        console.log("checkUserAccount", isAvailable);
        resolve(isAvailable);
      } catch {
        resolve(false);
      } finally {
        // 清理定时器引用
        debounceTimer = null;
      }
    }, delay);
  });
}

const CreateUserSchema = userCreateFormSchema.refine(
  async (data) => {
    if (data.account.length < 6) {
      return true;
    }
    const isAvailable = await checkUserAccountWithDebounce(data.account);
    return isAvailable;
  },
  { message: "账号已存在", path: ["account"] },
);

const UpdateUserSchema = userUpdateSchema;
type TCreateUserSchema = z.infer<typeof CreateUserSchema>;
type TUpdateUserSchema = z.infer<typeof UpdateUserSchema>;

export function UserDialog({
  open,
  onOpenChange,
  onSuccess,
  activeUser,
  isCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  activeUser?: any;
  isCreate?: boolean;
}) {
  const [deptTree, setDeptTree] = useState([]);
  const [roleList, setRoleList] = useState([]);

  const defaultValues = isCreate
    ? {
        name: "",
        account: "",
        deptId: "",
        email: "",
        password: "",
        confirmPassword: "",
        sex: "1" as const,
        status: "1" as const,
        roleIds: [] as string[],
      }
    : {
        id: activeUser.id,
        name: activeUser?.name || "",
        sex: (activeUser?.sex || "1") as "0" | "1" | "2",
        status: (activeUser?.status || "1") as "0" | "1",
        deptId: activeUser?.deptId || "",
        roleIds: (activeUser?.roleIds || []) as string[],
      };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, touchedFields, isSubmitted },
  } = useForm<TCreateUserSchema | TUpdateUserSchema>({
    resolver: zodResolver(isCreate ? CreateUserSchema : UpdateUserSchema),
    mode: "onChange",
    defaultValues: defaultValues,
  });

  useEffect(() => {
    axiosClient.get("/system/role/list").then((res) => {
      setRoleList(
        res.data.data.map((role: any) => ({
          label: role.name,
          value: role.id,
        })),
      );
    });
  }, []);

  const loadDeptTree = useCallback(() => {
    axiosClient.get("/system/dept/list").then((res) => {
      setDeptTree(res.data.data);
    });
  }, []);

  useEffect(() => {
    loadDeptTree();
  }, [loadDeptTree]);
  console.log("errors:", errors);

  const onSubmit = async (data: TCreateUserSchema | TUpdateUserSchema) => {
    try {
      console.log("onSubmit data:", data);
      console.log("errors:", errors);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 如果是创建用户，移除 confirmPassword 字段
      let submitData: any = data;
      if (isCreate && 'confirmPassword' in data) {
        const { confirmPassword, ...payload } = data as any;
        submitData = payload;
      }

      const res = await axiosClient.post(
        isCreate ? "/system/user/create" : "/system/user/update",
        submitData,
      );
      if (res.data.code === 200) {
        toast.success(res.data.msg);
        onSuccess?.();
      } else {
        toast.error(res.data.msg);
      }
    } catch (err: any) {
      toast.error(String(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="">
          <DialogTitle>{isCreate ? "新增用户" : "编辑用户"}</DialogTitle>
          <DialogDescription>
            {isCreate ? "请完善用户信息" : "请编辑用户信息"}
          </DialogDescription>
        </DialogHeader>
        <form className="max-h-[50vh] overflow-y-auto py-2 pr-2 sm:max-h-[65vh]">
          <FieldGroup className="gap-4!">
            <Field orientation="grid">
              <FieldLabel htmlFor="name">用户名</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="请输入用户名"
                {...register("name")}
              />
              {errors.name && (
                <FieldError errors={[errors.name]} className="col-start-2" />
              )}
            </Field>

            {isCreate && (
              <Field orientation="grid">
                <FieldLabel htmlFor="account">账号</FieldLabel>
                <Input
                  id="account"
                  type="text"
                  placeholder="请输入账号"
                  {...register("account")}
                />
                {(errors as any).account && (
                  <FieldError
                    errors={[(errors as any).account]}
                    className="col-start-2"
                  />
                )}
              </Field>
            )}

            <Field orientation="grid">
              <FieldLabel htmlFor="deptId">部门</FieldLabel>
              <Controller
                name="deptId"
                control={control}
                render={({ field }) => (
                  <TreeSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="请选择部门"
                    data={deptTree}
                  />
                )}
              />
              {errors.deptId && (
                <FieldError errors={[errors.deptId]} className="col-start-2" />
              )}
            </Field>

            {isCreate && (
              <Field orientation="grid">
                <FieldLabel htmlFor="email">邮箱</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  {...register("email")}
                />
                {(errors as any).email && (
                  <FieldError
                    errors={[(errors as any).email]}
                    className="col-start-2"
                  />
                )}
              </Field>
            )}

            <Field orientation="grid">
              <FieldLabel htmlFor="roles">角色</FieldLabel>
              <Controller
                name="roleIds"
                control={control}
                render={({ field }) => (
                  <MultiSelectDropdown
                    options={roleList}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.roleIds && (
                <FieldError errors={[errors.roleIds]} className="col-start-2" />
              )}
            </Field>

            {isCreate && (
              <>
                <Field orientation="grid">
                  <FieldLabel htmlFor="password">
                    <span>密码</span>
                    <HoverCardFormItem content="密码长度不能少于8位，必须包含至少一个英文字符、一个数字和一个特殊字符" />
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    {...register("password")}
                  />
                  {(errors as any).password &&
                    ((touchedFields as any).password || isSubmitted) && (
                      <FieldError
                        errors={[(errors as any).password]}
                        className="col-start-2"
                      />
                    )}
                </Field>

                <Field orientation="grid">
                  <FieldLabel htmlFor="confirm-password">确认密码</FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="请确认密码"
                    {...register("confirmPassword")}
                  />
                  {(errors as any).confirmPassword &&
                    ((touchedFields as any).confirmPassword || isSubmitted) && (
                      <FieldError
                        errors={[(errors as any).confirmPassword]}
                        className="col-start-2"
                      />
                    )}
                </Field>
              </>
            )}

            <Field orientation="grid">
              <FieldLabel className="shrink-0 grow-0 basis-[100px]">
                性别
              </FieldLabel>
              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue="0"
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="sex-male" />
                      <FieldLabel htmlFor="sex-male">其他</FieldLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="sex-female" />
                      <FieldLabel htmlFor="sex-female">男</FieldLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="sex-other" />
                      <FieldLabel htmlFor="sex-other">女</FieldLabel>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.sex && (touchedFields.sex || isSubmitted) && (
                <FieldError errors={[errors.sex]} className="col-start-2" />
              )}
            </Field>

            <Field orientation="grid">
              <FieldLabel className="shrink-0 grow-0 basis-[100px]">
                状态
              </FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue="0"
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="status-normal" />
                      <FieldLabel htmlFor="status-normal">启用</FieldLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="status-disable" />
                      <FieldLabel htmlFor="status-disable">禁用</FieldLabel>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.status && (touchedFields.status || isSubmitted) && (
                <FieldError errors={[errors.status]} className="col-start-2" />
              )}
            </Field>

            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    正在创建账户...
                  </span>
                </div>
              </div>
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
