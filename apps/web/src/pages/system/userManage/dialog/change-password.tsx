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
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { passwordSchema } from "@ruoyi/contracts";
import { axiosClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Field, FieldGroup, FieldLabel, FieldError } from "@ruoyi/ui";
import { useForm } from "react-hook-form";

const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });
type TChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export function DialogFormChangePassword({
  open,
  onOpenChange,
  onSuccess,
  rowData,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  rowData: { id: string; account: string };
}) {
  // const [formState, setFormState] = useState<TChangePasswordSchema>({
  //   password: "",
  //   confirmPassword: "",
  // });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: TChangePasswordSchema) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await axiosClient.post("/system/user/reset-password", {
        id: rowData.id,
        password: data.password,
      });
      if (res.status === 201) {
        toast.success("密码重置成功！");
        onSuccess?.();
      } else {
        console.error("密码重置失败", res);
        toast.error("密码重置失败，请联系管理员！");
      }
    } catch (err: any) {
      console.error("发生异常", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重置密码</DialogTitle>
          <DialogDescription>
            {`确定要重置用户 “${rowData.account}” 的密码吗？`}
          </DialogDescription>
        </DialogHeader>
        <form className="max-h-[50vh] overflow-y-auto py-2 pr-2 sm:max-h-[65vh]">
          <FieldGroup className="gap-4!">
            <Field orientation="grid">
              <FieldLabel htmlFor="password">新密码</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="请输入新密码"
                {...register("password")}
              />
              {errors.password && (
                <FieldError
                  errors={[errors.password]}
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
              {errors.confirmPassword && (
                <FieldError
                  errors={[errors.confirmPassword]}
                  className="col-start-2"
                />
              )}
            </Field>

            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    正在重置密码...
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
          <Button onClick={handleSubmit(onSubmit)}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
