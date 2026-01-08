import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "./apiClient";
import {
  ApiCode,
  type ApiResponse,
  type UserRouterItem,
  type SideBarItem,
  type UserInfo,
} from "@ruoyi/contracts";

async function fetchInfo() {
  const res = await axiosClient.get<ApiResponse<UserInfo>>("/getInfo");
  if (res.data.code !== ApiCode.SUCCESS) {
    throw new Error(res.data.msg);
  }
  return res.data.data;
}

async function fetchRouters() {
  const res = await axiosClient.get<ApiResponse<UserRouterItem[]>>("/getRouters");
  if (res.data.code !== ApiCode.SUCCESS) {
    throw new Error(res.data.msg);
  }
  return res.data.data;
}

async function fetchSideBar() {
  const res = await axiosClient.get<ApiResponse<SideBarItem[]>>(
    "/getSideBarMenus",
  );
  if (res.data.code !== ApiCode.SUCCESS) {
    throw new Error(res.data.msg);
  }
  return res.data.data;
}

export function useInfoQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["auth", "info"],
    queryFn: fetchInfo,
    enabled,
    retry: false,
    staleTime: 30_000000,
  });
}

export function useRoutersQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["auth", "routers"],
    queryFn: fetchRouters,
    enabled,
    retry: false,
    staleTime: 30_000000,
  });
}

export function useSideBarQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["auth", "sideBar"],
    queryFn: fetchSideBar,
    enabled,
    retry: false,
    staleTime: 30_000000,
  });
}
