import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "./apiClient";
import type { UserRouterItem, SideBarItem, UserInfo } from "@ruoyi/contracts";

async function fetchInfo() {
  const res = await axiosClient.get<{ data: UserInfo }>("/getInfo");
  return res.data.data;
}

async function fetchRouters() {
  const res = await axiosClient.get<{ data: UserRouterItem[] }>("/getRouters");
  return res.data.data;
}

async function fetchSideBar() {
  const res = await axiosClient.get<{ data: SideBarItem[] }>(
    "/getSideBarMenus",
  );
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
