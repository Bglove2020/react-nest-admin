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
import { axiosClient, setAccessToken } from "@/lib/apiClient";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginPayload } from "@ruoyi/contracts";
import { useQueryClient } from "@tanstack/react-query";

// 使用 contracts 中的 loginSchema
type LoginSchemaType = LoginPayload;

export function LoginForm() {
  // 初始化 useNavigate
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      account: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      const res = await axiosClient.post("/auth/login", {
        account: data.account,
        password: data.password,
      });
      // console.log(res)
      if (res.status === 201) {
        // Access Token 存入内存，Refresh Token 由服务端以 HttpOnly Cookie 设置
        const token = res.data.data.accessToken;
        // console.log('token',token)
        if (token) {
          setAccessToken(token);
        }
        // 强制刷新用户信息、路由和侧边栏数据
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["auth", "info"] }),
          queryClient.invalidateQueries({ queryKey: ["auth", "routers"] }),
          queryClient.invalidateQueries({ queryKey: ["auth", "sideBar"] }),
        ]);
        toast.success("登录成功！");
        navigate("/");
      }
      // else {
      //   setError(res.data.message || '登录失败') // 显示后端返回的错误信息
      // }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || "网络异常，请稍后再试",
      ); // 捕获并显示错误
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>登录</CardTitle>
        <CardDescription>请输入您的账号和密码登录</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {" "}
          {/* 将 onSubmit 绑定到 form 元素 */}
          <FieldGroup>
            <Field
              className="gap-2!"
              data-invalid={errors.account?.message ? "true" : "false"}
            >
              <FieldLabel htmlFor="account">账号</FieldLabel>
              <Input
                id="account"
                type="text"
                placeholder="请输入账号：admin"
                aria-invalid={errors.account?.message ? "true" : "false"}
                {...register("account")}
              />
              {errors.account && (
                <FieldDescription className="mt-0 text-left text-destructive">
                  {errors.account.message}
                </FieldDescription>
              )}{" "}
              {/* 显示账号错误信息 */}
            </Field>

            <Field
              className="gap-2!"
              data-invalid={errors.password?.message ? "true" : "false"}
            >
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码：admin123."
                aria-invalid={errors.password?.message ? "true" : "false"}
                {...register("password")}
              />
              {errors.password && (
                <FieldDescription className="mt-1 text-left text-destructive">
                  {errors.password.message}
                </FieldDescription>
              )}{" "}
              {/* 显示密码错误信息 */}
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={isSubmitting} // 登录中禁用按钮
              >
                {isSubmitting ? "登录中..." : "登录"}
              </Button>
              <FieldDescription className="text-center">
                没有账号？{" "}
                <Link to="/auth/register" className="underline">
                  注册
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
