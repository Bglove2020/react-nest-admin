import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@ruoyi/ui";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import * as z from "zod";
import {
  ApiCode,
  type ApiResponse,
  roleCreateSchema,
  type FrontendMenu,
} from "@ruoyi/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { axiosClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import DialogLoading from "@/components/Dialog/loading";
import { TreeMultiSelect } from "@/components/Select/tree-multi-select";

export default function AddRoleDialog({
  open,
  onOpenChange,
  onSuccess,
  activeRole,
  isCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  activeRole?: {
    id: string;
    name: string;
    roleKey: string;
    sortOrder: number;
    status: "0" | "1";
    menuIds?: string[];
  };
  isCreate?: boolean;
}) {
  const [menuTree, setMenuTree] = useState<FrontendMenu[]>([]);

  // 加载部门树数据
  useEffect(() => {
    axiosClient
      .get<ApiResponse<FrontendMenu[]>>("/system/menu/list")
      .then((res) => {
        setMenuTree(res.data.data);
      })
      .catch((err) => {
        console.error("加载菜单列表失败:", err);
      });
  }, []);

  const AddRoleSchema = roleCreateSchema;
  type TAddRoleSchema = z.infer<typeof AddRoleSchema>;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TAddRoleSchema>({
    resolver: zodResolver(AddRoleSchema),
    mode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      name: isCreate ? "" : activeRole?.name,
      roleKey: isCreate ? "" : activeRole?.roleKey,
      sortOrder: isCreate ? 0 : activeRole?.sortOrder,
      status: isCreate ? "1" : activeRole?.status,
      menuIds: isCreate ? [] : activeRole?.menuIds,
    },
  });

  const onSubmit = async (data: TAddRoleSchema) => {
    console.log("onSubmit data:", data);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const roleData = {
        name: data.name,
        roleKey: data.roleKey,
        sortOrder: data.sortOrder,
        status: data.status,
        menuIds: data.menuIds,
        id: isCreate ? undefined : activeRole?.id,
      };
      const res = await axiosClient.post<ApiResponse<null>>(
        isCreate ? "/system/role/create" : "/system/role/update",
        roleData,
      );
      // console.log('res',res);
      if (res.data.code === ApiCode.SUCCESS) {
        toast.success(res.data.msg);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(res.data.msg);
      }
    } catch (err: any) {
      console.error("发生异常", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isCreate ? "新增角色" : "编辑角色"}</DialogTitle>
        </DialogHeader>
        <form className="flex-1 overflow-y-auto py-2 pr-2">
          <FieldGroup className="gap-4!">
            <Field orientation="grid">
              <FieldLabel htmlFor="name">角色名称</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="请输入角色名称"
                {...register("name")}
              />
              {errors.name && (
                <FieldError errors={[errors.name]} className="col-start-2" />
              )}
            </Field>

            <Field orientation="grid">
              <FieldLabel htmlFor="roleKey">权限字符</FieldLabel>
              <Input
                id="roleKey"
                type="text"
                placeholder="请输入角色权限字符"
                {...register("roleKey")}
              />
              {errors.roleKey && (
                <FieldError errors={[errors.roleKey]} className="col-start-2" />
              )}
            </Field>

            <Field orientation="grid">
              <FieldLabel htmlFor="sortOrder">排序号</FieldLabel>
              <Input
                id="sortOrder"
                type="number"
                placeholder="请输入排序号"
                {...register("sortOrder", { valueAsNumber: true })}
              />
              {errors.sortOrder && (
                <FieldError
                  errors={[errors.sortOrder]}
                  className="col-start-2"
                />
              )}
            </Field>

            <Field orientation="grid">
              <FieldLabel>状态</FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="status-normal" />
                      <label
                        htmlFor="status-normal"
                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        正常
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="status-disable" />
                      <label
                        htmlFor="status-disable"
                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        停用
                      </label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.status && (
                <FieldError errors={[errors.status]} className="col-start-2" />
              )}
            </Field>

            <Field orientation="grid">
              <FieldLabel className="items-start pt-1.5">菜单权限</FieldLabel>
              <Controller
                name="menuIds"
                control={control}
                render={({ field }) => (
                  <div className="max-h-[250px] overflow-y-auto rounded-md border border-input shadow-xs">
                    <TreeMultiSelect
                      value={field.value}
                      onChange={field.onChange}
                      data={menuTree}
                    />
                  </div>
                )}
              />
              {errors.menuIds && (
                <FieldError errors={[errors.menuIds]} className="col-start-2" />
              )}
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit(onSubmit as any)}>
            确定
          </Button>
        </DialogFooter>
        {isSubmitting && (
          <DialogLoading
            title={isCreate ? "正在创建角色..." : "正在编辑角色..."}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
