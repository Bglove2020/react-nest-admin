import { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { axiosClient } from "@/lib/apiClient";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogClose,
} from "@ruoyi/ui";
import { Field, FieldGroup, FieldLabel } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import DialogLoading from "@/components/Dialog/loading";

// Schema & SubForms
import {
  formSchema,
  DEFAULT_VALUES,
  getInitialValues,
  type TFormSchema,
  type MenuType,
} from "../schema/form.schema";
import CatalogSubForm from "../subForm/Catalog";
import MenuSubForm from "../subForm/Menu";
import ButtonSubForm from "../subForm/Button";
import type { FrontendMenu } from "@ruoyi/contracts";

export default function FormDialog({
  open,
  onOpenChange,
  onSuccess,
  activeData,
  isCreate = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  activeData?: FrontendMenu;
  isCreate?: boolean;
}) {
  const [menuTree, setMenuTree] = useState([]);

  // 加载菜单树数据
  useEffect(() => {
    if (open) {
      axiosClient
        .get("/system/menu/list")
        .then((res) => setMenuTree(res.data.data));
    }
  }, [open]);

  const initialValues = getInitialValues(isCreate, activeData);
  console.log("initialValues:", initialValues);

  const methods = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    // shouldUnregister: true,
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  const menuType = watch("menuType");

  // 新增模式下的类型切换
  const handleTypeChange = (val: MenuType) => {
    if (isCreate) {
      reset(DEFAULT_VALUES[val]);
    }
  };

  const onSubmit = async (data: TFormSchema) => {
    try {
      console.log("onSubmit data:", data);
      const url = isCreate ? "/system/menu/create" : "/system/menu/update";
      const payload = isCreate ? data : { ...data, id: activeData?.id };

      const res = await axiosClient.post(url, payload);
      if (res.data.code === 200) {
        toast.success(res.data.msg);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(res.data.msg);
      }
    } catch (err) {
      console.error("提交异常", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogTitle>{isCreate ? "新增菜单" : "编辑菜单"}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[65vh] overflow-y-auto py-4 pr-2"
          >
            <FieldGroup className="gap-6!">
              {/* 类型选择器 */}
              {isCreate && (
                <Field orientation="grid">
                  <FieldLabel>菜单类型</FieldLabel>
                  <Controller
                    name="menuType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleTypeChange(val as MenuType);
                        }}
                        className="flex flex-row gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="M" id="m" />
                          <label htmlFor="m">目录</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="C" id="c" />
                          <label htmlFor="c">菜单</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="F" id="f" />
                          <label htmlFor="f">按钮</label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </Field>
              )}

              {/* 动态子表单 */}
              {menuType === "M" && <CatalogSubForm />}
              {menuType === "C" && (
                <MenuSubForm isCreate={isCreate} menuTree={menuTree} />
              )}
              {menuType === "F" && (
                <ButtonSubForm isCreate={isCreate} menuTree={menuTree} />
              )}
            </FieldGroup>
          </form>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                console.log("errors:", methods.formState.errors);
                handleSubmit(onSubmit)();
              }}
            >
              确定
            </Button>
          </DialogFooter>
        </FormProvider>
        {isSubmitting && <DialogLoading title="提交中..." />}
      </DialogContent>
    </Dialog>
  );
}
