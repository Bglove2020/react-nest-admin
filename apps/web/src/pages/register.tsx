import { Button } from "@ruoyi/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ruoyi/ui";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ApiCode,
  type ApiResponse,
  registerSchema,
  passwordSchema,
} from "@ruoyi/contracts";
import { axiosClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { HoverCardFormItem } from "@ruoyi/ui";

/**
 * 前端注册表单 schema
 * 基于 registerSchema 扩展，添加确认密码字段
 */
const registerFormSchema = registerSchema.extend({
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerFormSchema>;

async function checkUserAccount(account: string) {
  try {
    const response = await axiosClient.get<ApiResponse<{ available: boolean }>>(
      `system/user/checkUserAccount?account=${account}`,
    );
    if (response.data.code === ApiCode.SUCCESS) {
      return response.data.data.available;
    }
    return false;
  } catch (error) {
    console.error("检查账号是否存在失败:", error);
    return false;
  }
}

// 用于缓存已校验过的账号，避免重复校验
let lastValidatedAccount = "";
let lastValidationResult = true;

// 添加账号可用性校验
const RegisterSchema = registerFormSchema.refine(
  async (data) => {
    if (data.account === lastValidatedAccount) {
      return lastValidationResult;
    }

    const isAvailable = await checkUserAccount(data.account);
    lastValidatedAccount = data.account;
    lastValidationResult = isAvailable;
    return isAvailable;
  },
  {
    message: "账号已存在",
    path: ["account"],
  },
);

export function RegisterForm({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      account: "",
      email: "",
      password: "",
      confirmPassword: "",
      sex: "1",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      // 模拟 API 调用延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 移除 confirmPassword，只发送后端需要的字段
      const { confirmPassword, ...payload } = data;

      // 实际的注册 API 调用
      const res = await axiosClient.post<ApiResponse<null>>(
        "/auth/register",
        payload,
      );
      console.log(res);
      if (res.data.code === ApiCode.SUCCESS) {
        // 注册成功，跳转到登录页
        console.log("注册成功，开始跳转页面！");
        navigate("../login");
        toast.success(res.data.msg);
      } else {
        console.error("注册失败", res);
        toast.error(res.data.msg || "注册失败");
        // toast.error(res.data.message || '注册失败');
      }
    } catch (err: any) {
      console.error("发生异常", err);
      toast.error(err?.response?.data?.msg || err?.message || "注册失败");
      // toast.error(err?.response?.data?.message || err.message || '网络异常,请稍后再试');
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle className="text-center">注册账号</CardTitle>
        <CardDescription className="text-center">
          请输入您的个人信息以创建账号
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4!">
            <Field className="gap-2!">
              <FieldLabel htmlFor="name">用户名</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="请输入用户名"
                {...register("name")}
              />
              {errors.name && (
                <FieldDescription className="mt-0 text-left text-destructive">
                  {errors.name.message}
                </FieldDescription>
              )}
            </Field>

            <Field className="gap-2!">
              <FieldLabel htmlFor="account">
                <span>账号</span>
                <HoverCardFormItem content="账号长度最少6位，不能重复" />
              </FieldLabel>
              <Input
                id="account"
                type="text"
                placeholder="请输入账号"
                {...register("account")}
              />
              {errors.account && (
                <FieldDescription className="mt-0 text-left text-destructive">
                  {errors.account.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">邮箱</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                {...register("email")}
              />
              {errors.email && (
                <FieldDescription className="mt-0 text-left text-destructive">
                  {errors.email.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
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
              {errors.password && (
                <FieldDescription className="mt-0 text-left text-destructive">
                  {errors.password.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">确认密码</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="请确认密码"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <FieldDescription className="mt-0 text-left text-destructive">
                  {errors.confirmPassword.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="sex">性别</FieldLabel>
              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue="1"
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
              {errors.sex && (
                <FieldDescription className="mt-0 text-left text-destructive">
                  {errors.sex.message}
                </FieldDescription>
              )}
            </Field>

            {/* Loading overlay */}
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

            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      注册中...
                    </>
                  ) : (
                    "注册"
                  )}
                </Button>
                <FieldDescription className="px-6 text-center">
                  已有账号？{" "}
                  <Link to="/auth/login" className="underline">
                    登录
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
