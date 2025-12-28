import { SidebarProvider, SidebarTrigger } from "@ruoyi/ui";
import { AppSidebar } from "@/components/app-sidebar";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { Separator } from "@ruoyi/ui";
import { Outlet, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@ruoyi/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ruoyi/ui";
import { useSideBarQuery } from "@/lib/authQueries";
import { useInfoQuery } from "@/lib/authQueries";
import { ThemeToggle } from "@ruoyi/ui";

export default function AppLayout() {
  const { data: sideBarData } = useSideBarQuery(true);
  const { data: userInfo } = useInfoQuery(true);
  const navigate = useNavigate();
  console.log(userInfo);
  console.log(sideBarData);

  return (
    <SidebarProvider>
      <AppSidebar sideBarData={sideBarData ?? []} userInfo={userInfo!} />
      <main className="m-0 max-w-full flex-1 rounded-2xl border-border bg-card shadow-black/10 sm:mx-2 sm:my-2 sm:border">
        <header className="sticky top-0 z-9 flex h-16 items-center gap-2 rounded-t-2xl border-b border-border bg-card/50 p-3 backdrop-blur-md sm:gap-4">
          <SidebarTrigger className="scale-120 sm:scale-100" />
          <Separator
            orientation="vertical"
            className="ml-1 data-[orientation=vertical]:h-6 sm:ml-0"
          />
          <AppBreadcrumb />
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="text-sm font-medium">
                    SN
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                {/* <DropdownMenuSeparator /> */}
                <DropdownMenuItem
                  onSelect={() => navigate("/profile")}
                  className="cursor-pointer"
                >
                  个人信息
                </DropdownMenuItem>
                <DropdownMenuItem disabled>消息通知</DropdownMenuItem>
                <DropdownMenuItem disabled>会员中心</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
