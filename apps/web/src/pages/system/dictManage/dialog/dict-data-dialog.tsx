import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ruoyi/ui";
import { Field, FieldError, FieldGroup, FieldLabel } from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { dictDataCreateSchema, type FrontendDictData } from "@ruoyi/contracts";
import { axiosClient } from "@/lib/apiClient";
import { toast } from "sonner";
import DialogLoading from "@/components/Dialog/loading";
// import type { DictData } from "@/lib/dictQueries";

const schema = dictDataCreateSchema;

type FormValues = z.infer<typeof schema>;

export default function DictDataDialog({
  open,
  onOpenChange,
  onSuccess,
  activeData,
  isCreate,
  dictType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  activeData?: FrontendDictData | null;
  isCreate?: boolean;
  dictType: string;
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
      label: isCreate ? "" : (activeData?.label ?? ""),
      value: isCreate ? "" : (activeData?.value ?? ""),
      sortOrder: isCreate ? 0 : (activeData?.sortOrder ?? 0),
      status: (isCreate ? "1" : (activeData?.status ?? "1")) as "0" | "1",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      type: dictType,
      id: isCreate ? undefined : activeData?.id,
    };
    try {
      const res = await axiosClient.post(
        isCreate ? "/system/dict/data/create" : "/system/dict/data/update",
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "新增字典数据" : "编辑字典数据"}
          </DialogTitle>
        </DialogHeader>
        <form className="max-h-[50vh overflow-y-auto py-2 pr-2 sm:max-h-[65vh]">
          <FieldGroup className="gap-4!">
            <Field orientation="grid">
              <FieldLabel htmlFor="dictType">字典类型</FieldLabel>
              <Input
                id="dictType"
                value={dictType}
                readOnly
                disabled
                className="bg-muted"
              />
            </Field>

            <Field orientation="grid">
              <FieldLabel htmlFor="label">字典标签</FieldLabel>
              <Input
                id="label"
                type="text"
                placeholder="请输入字典标签"
                {...register("label")}
              />
              {errors.label && (
                <FieldError errors={[errors.label]} className="col-start-2" />
              )}
            </Field>

            <Field orientation="grid">
              <FieldLabel htmlFor="value">字典键值</FieldLabel>
              <Input
                id="value"
                type="text"
                placeholder="请输入字典键值"
                {...register("value")}
              />
              {errors.value && (
                <FieldError errors={[errors.value]} className="col-start-2" />
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
                      <RadioGroupItem value="1" id="dict-data-status-normal" />
                      <label
                        htmlFor="dict-data-status-normal"
                        className="text-sm leading-none font-medium"
                      >
                        正常
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="dict-data-status-disable" />
                      <label
                        htmlFor="dict-data-status-disable"
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
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit as any)}
            disabled={!dictType}
          >
            确定
          </Button>
        </DialogFooter>
        {isSubmitting && (
          <DialogLoading
            title={isCreate ? "正在创建字典数据..." : "正在更新字典数据..."}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
