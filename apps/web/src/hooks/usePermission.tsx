import { useQueryClient } from "@tanstack/react-query";
import React from "react";

/**
 * 获取权限判断方法，基于 React Query 的 getInfo 缓存。
 * 使用示例：
 * const hasPerm = useHasPerm();
 * if (hasPerm("system:user:create")) { ... }
 */
export function useHasPerm() {
  const queryClient = useQueryClient();
  const perms =
    (queryClient.getQueryData<{ permissions?: string[] }>(["auth", "info"])
      ?.permissions ?? []);

  return (required: string) =>
    perms.includes("*:*:*") || perms.includes(required);
}

/**
 * 包装组件版本，便于在 JSX 中做按钮级权限判断。
 */
export function Permission({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const hasPerm = useHasPerm();
  if (!hasPerm(permission)) return null;
  return <>{children}</>;
}
