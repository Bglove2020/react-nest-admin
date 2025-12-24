"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@ruoyi/ui";
import { type SideBarItem, type UserInfo } from "@/lib/authQueries";

export function AppSidebar({
  sideBarData,
  userInfo,
}: {
  sideBarData: SideBarItem[];
  userInfo: UserInfo;
}) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {/* <PackageOpen className="size-5" /> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    width="24"
                    height="24"
                    className="text-sidebar-primary-foreground"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 15,55 C 15,75 35,90 60,85 C 75,82 85,70 80,55" />

                      <path d="M 45,60 C 35,40 45,15 65,20 C 80,25 75,45 60,50" />
                    </g>
                  </svg>
                </div>
                <div className="grid flex-1 gap-0.5 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    ruoyi-react-nestjs
                  </span>
                  <span className="truncate text-xs">类若依的管理系统</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sideBarData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
