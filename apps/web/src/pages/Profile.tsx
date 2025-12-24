import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@ruoyi/ui";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@ruoyi/ui";
import { Input } from "@ruoyi/ui";
import { Badge } from "@ruoyi/ui";
import { Button } from "@ruoyi/ui";
import { RadioGroup, RadioGroupItem } from "@ruoyi/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@ruoyi/ui";
import { Separator } from "@ruoyi/ui";
import { Loader2 } from "lucide-react";
import { emailSchema, nameSchema, sexSchema } from "@ruoyi/contracts";
import { useInfoQuery } from "@/lib/authQueries";
import { axiosClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  sex: sexSchema,
    avatar: z
      .string()
      .trim()
      .url("请输入有效的图片链接")
      .or(z.literal("")),
});
type ProfileFormValues = z.infer<typeof ProfileSchema>;

const sexLabels: Record<ProfileFormValues["sex"], string> = {
  "0": "Other",
  "1": "Male",
  "2": "Female",
};

export default function Profile() {
  const queryClient = useQueryClient();
  const { data, isFetching, isError } = useInfoQuery(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      sex: "0",
      avatar: "",
    },
  });

  const user = data?.user;

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        email: user.email ?? "",
        sex: (user.sex as ProfileFormValues["sex"]) ?? "0",
        avatar: user.avatar ?? "",
      });
    }
  }, [user, reset]);

  // const statusBadge = useMemo(() => {
  //   if (!user?.status) return null;
  //   const active = user.status === "1";
  //   return (
  //     <Badge variant={active ? "default" : "outline"}>
  //       {active ? "Active" : "Disabled"}
  //     </Badge>
  //   );
  // }, [user?.status]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.publicId) {
      toast.error("Missing user id, please re-login and try again.");
      return;
    }
    try {
      const res = await axiosClient.post("/system/user/update", {
        publicId: user.publicId,
        name: values.name,
        email: values.email,
        sex: values.sex,
        avatar: values.avatar,
      });
      if (res.data.code === 200) {
        toast.success(res.data.msg || "Profile updated");
        await queryClient.invalidateQueries({ queryKey: ["auth", "info"] });
        reset(values);
      } else {
        toast.error(res.data.msg || "Update failed");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Update failed",
      );
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">个人信息</h2>
            <p className="text-sm text-muted-foreground">
              查看并编辑您的个人信息
            </p>
          </div>
        </div> */}

        <Card className="gap-4 border-dashed">
          <CardHeader>
            <CardTitle>账号简介</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.slice(0, 2)?.toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-lg font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="secondary">Account: {user?.account}</Badge>
                  {user?.sex && (
                    <Badge variant="outline">
                      Gender:{" "}
                      {sexLabels[user.sex as ProfileFormValues["sex"]] ??
                        "Unknown"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Badge>Roles</Badge>
              {data?.roles?.length ? (
                data.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No roles assigned
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>编辑个人信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="!gap-4">
                <Field orientation="grid">
                  <FieldLabel htmlFor="account">账号</FieldLabel>
                  <Input
                    id="account"
                    value={user?.account ?? ""}
                    disabled
                    readOnly
                  />
                  <FieldDescription className="col-start-2">
                    账号不能修改（匹配用户模块规则）。
                  </FieldDescription>
                </Field>

                <Field
                  orientation="grid"
                  data-invalid={errors.name ? "true" : undefined}
                >
                  <FieldLabel htmlFor="name">用户名</FieldLabel>
                  <Input
                    id="name"
                    placeholder="请输入用户名"
                    {...register("name")}
                  />
                  {errors.name && (
                    <FieldError
                      errors={[errors.name]}
                      className="col-start-2"
                    />
                  )}
                </Field>

                <Field
                  orientation="grid"
                  data-invalid={errors.email ? "true" : undefined}
                >
                  <FieldLabel htmlFor="email">邮箱</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱"
                    {...register("email")}
                  />
                  {errors.email && (
                    <FieldError
                      errors={[errors.email]}
                      className="col-start-2"
                    />
                  )}
                </Field>

                <Field
                  orientation="grid"
                  data-invalid={errors.sex ? "true" : undefined}
                >
                  <FieldLabel>性别</FieldLabel>
                  <Controller
                    name="sex"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="1" id="sex-male" />
                          <FieldLabel htmlFor="sex-male">男</FieldLabel>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="2" id="sex-female" />
                          <FieldLabel htmlFor="sex-female">女</FieldLabel>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="0" id="sex-other" />
                          <FieldLabel htmlFor="sex-other">其他</FieldLabel>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.sex && (
                    <FieldError errors={[errors.sex]} className="col-start-2" />
                  )}
                </Field>

                <Field
                  orientation="grid"
                  data-invalid={errors.avatar ? "true" : undefined}
                >
                  <FieldLabel htmlFor="avatar">Avatar URL</FieldLabel>
                  <Input
                    id="avatar"
                    placeholder="https://..."
                    {...register("avatar")}
                  />
                  {errors.avatar && (
                    <FieldError
                      errors={[errors.avatar]}
                      className="col-start-2"
                    />
                  )}
                </Field>
              </FieldGroup>

              <FieldSeparator />

              <div className="flex flex-wrap justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || isFetching || !isDirty}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading latest profile data...
          </div>
        )}
        {isError && (
          <div className="text-sm text-destructive">
            Failed to load profile. Please refresh or re-login.
          </div>
        )}
      </div>
    </div>
  );
}
