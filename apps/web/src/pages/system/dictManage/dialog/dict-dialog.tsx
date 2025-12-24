import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ruoyi/ui";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { dictTypeCreateSchema } from "@ruoyi/contracts";
import { axiosClient } from "@/lib/apiClient";
import { toast } from "sonner";
import DialogLoading from "@/components/Dialog/loading";
import type { DictType } from "@/lib/dictQueries";

const schema = dictTypeCreateSchema;

type FormValues = z.infer<typeof schema>;

export default function DictDialog({
  open,
  onOpenChange,
  onSuccess,
  activeDict,
  isCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  activeDict?: DictType | null;
  isCreate?: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: isCreate ? "" : (activeDict?.name ?? ""),
      type: isCreate ? "" : (activeDict?.type ?? ""),
      sortOrder: isCreate ? 0 : (activeDict?.sortOrder ?? 0),
      status: isCreate ? "1" : ((activeDict?.status as "0" | "1") ?? "1"),
    },
  });

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      publicId: isCreate ? undefined : activeDict?.publicId,
    };
    try {
      const res = await axiosClient.post(
        isCreate ? "/system/dict/create" : "/system/dict/update",
        payload,
      );
      if (res.data.code === 200) {
        toast.success(res.data.msg);
        onOpenChange(false);
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
        <DialogHeader>
          <DialogTitle>{isCreate ? "新增字典" : "编辑字典"}</DialogTitle>
        </DialogHeader>
        <form className="max-h-[50vh overflow-y-auto py-2 pr-2 sm:max-h-[65vh]">
          <FieldGroup className="!gap-4">
            <Field orientation="grid">
              <FieldLabel htmlFor="name">字典名称</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="请输入字典名称"
                {...register("name")}
              />
              {errors.name && (
                <FieldError errors={[errors.name]} className="col-start-2" />
              )}
            </Field>

            <Field orientation="grid">
              <FieldLabel htmlFor="type">字典类型</FieldLabel>
              <Input
                id="type"
                type="text"
                placeholder="请输入字典类型"
                {...register("type")}
              />
              {errors.type && (
                <FieldError errors={[errors.type]} className="col-start-2" />
              )}
            </Field>

            <Field orientation="grid">
              <FieldLabel htmlFor="sortOrder">显示顺序</FieldLabel>
              <Input
                id="sortOrder"
                type="number"
                placeholder="请输入显示顺序"
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
                      <RadioGroupItem value="1" id="dict-type-status-normal" />
                      <label
                        htmlFor="dict-type-status-normal"
                        className="text-sm leading-none font-medium"
                      >
                        正常
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="dict-type-status-disable" />
                      <label
                        htmlFor="dict-type-status-disable"
                        className="text-sm leading-none font-medium"
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
            title={isCreate ? "正在创建字典类型..." : "正在更新字典类型..."}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
