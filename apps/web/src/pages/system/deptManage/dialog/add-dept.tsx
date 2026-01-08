import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@ruoyi/ui";
import { Field, FieldError, FieldGroup, FieldLabel } from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import * as z from "zod";
import { ApiCode, type ApiResponse, deptCreateSchema } from "@ruoyi/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { TreeSelect } from "@/components/Select/tree-select";
import { axiosClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { SingleSelect } from "../../../../components/Select/single-select";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import type { DeptNode } from "@/types/tree";
import DialogLoading from "@/components/Dialog/loading";

export default function AddDeptDialog({
  open,
  onOpenChange,
  onSuccess,
  activeDept,
  isCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  activeDept?: DeptNode;
  isCreate?: boolean;
}) {
  const [deptTree, setDeptTree] = useState<DeptNode[]>([]);
  const [userList, setUserList] = useState<Array<{ id: string; name: string }>>(
    [],
  );

  // 加载部门树数据
  useEffect(() => {
    axiosClient
      .get<ApiResponse<DeptNode[]>>("/system/dept/list")
      .then((res) => {
        setDeptTree(res.data.data);
      })
      .catch((err) => {
        console.error("加载部门列表失败:", err);
      });
  }, []);

  useEffect(() => {
    axiosClient.get<ApiResponse<{ list: Array<{ id: string; name: string }> }>>(
      "/system/user/list",
    ).then((res) => {
      setUserList(res.data.data.list);
    });
  }, []);

  const AddDeptSchema = deptCreateSchema;
  type TAddDeptSchema = z.infer<typeof AddDeptSchema>;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TAddDeptSchema>({
    resolver: zodResolver(AddDeptSchema),
    mode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      name: isCreate ? "" : activeDept?.name || "",
      parentId: activeDept?.id || "",
      sortOrder: isCreate ? 0 : activeDept?.sortOrder || 0,
      status: (isCreate ? "1" : activeDept?.status === "0" ? "0" : "1") as
        | "1"
        | "0",
      leaderId: isCreate ? "" : activeDept?.leaderId || "",
    },
  });

  const onSubmit = async (data: TAddDeptSchema) => {
    console.log("onSubmit data:", data);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let accountData = {};
      if (isCreate) {
        accountData = data;
      } else {
        accountData = {
          id: activeDept?.id,
          name: data.name,
          sortOrder: data.sortOrder,
          status: data.status,
          leaderId: data.leaderId,
        };
      }
      const res = await axiosClient.post<ApiResponse<null>>(
        isCreate ? "/system/dept/create" : "/system/dept/update",
        accountData,
      );
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isCreate ? "新增部门" : "编辑部门"}</DialogTitle>
        </DialogHeader>
        <form className="max-h-[50vh overflow-y-auto py-2 pr-2 sm:max-h-[65vh]">
          <FieldGroup className="gap-4!">
            {isCreate && (
              <Field orientation="grid">
                <FieldLabel htmlFor="parentId">父部门</FieldLabel>
                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <TreeSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="请选择父部门"
                      data={deptTree}
                      allowSelectParent={true}
                      disabled={!isCreate}
                    />
                  )}
                />
                {errors.parentId && (
                  <FieldError
                    errors={[errors.parentId]}
                    className="col-start-2"
                  />
                )}
              </Field>
            )}

            <Field orientation="grid">
              <FieldLabel htmlFor="name">部门名称</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="请输入部门名称"
                {...register("name")}
              />
              {errors.name && (
                <FieldError errors={[errors.name]} className="col-start-2" />
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
              <FieldLabel htmlFor="leaderId">负责人</FieldLabel>
              <Controller
                name="leaderId"
                control={control}
                render={({ field }) => (
                  <SingleSelect
                    className="w-full"
                    placeholder="请选择负责人"
                    options={userList.map((user) => ({
                      label: user.name,
                      value: user.id,
                    }))}
                    value={field.value}
                    // label="负责人"
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.leaderId && (
                <FieldError
                  errors={[errors.leaderId]}
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
                    className="flex flex-row gap-4 pt-2"
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
            title={isCreate ? "正在创建部门..." : "正在编辑部门..."}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
