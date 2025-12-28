import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ruoyi/ui";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@ruoyi/ui";
import type { SideBarItem } from "@ruoyi/contracts";

export function NavMain({ items }: { items: SideBarItem[] }) {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const isMatch = (url: string | null | undefined) => Boolean(url && pathname.includes(url));

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const groupActive =
            isMatch(item.url) ||
            (item.children?.some((s: SideBarItem) => isMatch(s.url)) ?? false);
          return (
            <Collapsible
              key={item.title + pathname}
              asChild
              defaultOpen={groupActive}
            >
              <SidebarMenuItem>
                {item.children?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <div className="group">
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={groupActive}
                        >
                          <span className="gap-4">
                            {/* <item.icon /> */}
                            <span>{item.title}</span>
                          </span>
                        </SidebarMenuButton>
                        <SidebarMenuAction className="transition-transform group-data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="pt-2 gap-2">
                        {item.children?.map((subItem: SideBarItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isMatch(subItem.url)}
                            >
                              <Link
                                to={
                                  subItem.frame
                                    ? (subItem.url ?? "#")
                                    : "/" + (subItem.url ?? "")
                                }
                                className="gap-4"
                                onClick={handleLinkClick}
                              >
                                {/* <subItem.icon /> */}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isMatch(item.url)}
                  >
                    <Link
                      to={
                        item.frame
                          ? (item.url ?? "#")
                          : "/" + (item.url ?? "")
                      }
                      className="gap-4"
                      onClick={handleLinkClick}
                    >
                      {/* <item.icon /> */}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
