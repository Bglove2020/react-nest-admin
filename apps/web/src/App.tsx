import { useMemo } from "react";
import { Navigate, type RouteObject, useRoutes } from "react-router-dom";
import { useInfoQuery, useRoutersQuery } from "@/lib/authQueries";
import { getAccessToken } from "@/lib/apiClient";
import type { RouterItem } from "@/types/router";
import AuthLayout from "./layouts/AuthLayout";
import { LoginForm } from "./pages/login";
import { RegisterForm } from "./pages/register";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserManage from "./pages/system/userManage/UserManage";
import DeptManage from "./pages/system/deptManage/DeptManage";
import MenuManage from "./pages/system/menuManage/MenuManage";
import RoleManage from "./pages/system/roleManage/RoleManage";
import DictManage from "./pages/system/dictManage/DictManage";
import DictDataPage from "./pages/system/dictManage/DictDataPage";
import DialogLoading from "./components/Dialog/loading";

const viewMap: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  "system/user-management": <UserManage />,
  "system/dept-management": <DeptManage />,
  "system/menu-management": <MenuManage />,
  "system/role-management": <RoleManage />,
  "system/dict-management": <DictManage />,
  "system/dict-data-management": <DictDataPage />,
};

function mapRouters(nodes: RouterItem[]): RouteObject[] {
  return nodes
    .filter((node) => viewMap[node.path])
    .map((node) => {
      return {
        path: node.path,
        element: viewMap[node.path],
      };
    });
}

function RequireAuth({
  token,
  infoLoading,
  routerLoading,
  hasError,
  children,
}: {
  token: string | null;
  infoLoading: boolean;
  routerLoading: boolean;
  hasError: boolean;
  children: React.ReactNode;
}) {
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  if (infoLoading || routerLoading) {
    return <div className="p-6 text-center">加载中...</div>;
  }
  if (hasError) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const token = getAccessToken();
  const infoQuery = useInfoQuery(!!token);
  const routersQuery = useRoutersQuery(!!token);

  const dynamicRoutes = useMemo(
    () => mapRouters(routersQuery.data ?? []),
    [routersQuery.data],
  );

  // 根据用户是否有菜单权限决定默认首页
  const defaultHomePage = useMemo(() => {
    // 如果有动态路由（菜单权限），跳转到 dashboard
    // 否则跳转到个人简介页面
    return dynamicRoutes.length > 0 ? "/dashboard" : "/profile";
  }, [dynamicRoutes]);

  const isLoading = infoQuery.isFetching || routersQuery.isFetching;

  const element = useRoutes([
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        { index: true, element: <Navigate to="/auth/login" replace /> },
        { path: "login", element: <LoginForm /> },
        { path: "register", element: <RegisterForm /> },
      ],
    },
    {
      path: "/",
      element: (
        <RequireAuth
          token={token}
          infoLoading={infoQuery.isFetching}
          routerLoading={routersQuery.isFetching}
          hasError={Boolean(infoQuery.isError || routersQuery.isError)}
        >
          <AppLayout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to={defaultHomePage} replace /> },
        { path: "profile", element: <Profile /> },
        ...dynamicRoutes,
      ],
    },
    {
      path: "*",
      element: isLoading ? (
        <DialogLoading title="页面加载中..." />
      ) : (
        <Navigate to={token ? defaultHomePage : "/auth/login"} replace />
      ),
    },
  ]);

  return <div className="App">{element}</div>;
}

export default App;
