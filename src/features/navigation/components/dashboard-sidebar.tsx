"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "$/components/ui/sidebar";
import {
  Home,
  FolderOpen,
  SparklesIcon,
  FileCheck,
  Package,
} from "lucide-react";
import SidebarLogo from "./sidebar-logo";
import Link from "$/components/ui/link";
import { SidebarLogOutButton } from "./sidebar-logout-button";
import { usePathname } from "next/navigation";
import { cn } from "$/lib/utils";
import { useSidebarPopupStore } from "../store/use-sidebar-popup-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "$/components/ui/tooltip";

const navigationItems = [
  {
    id: "home",
    title: <span>Home</span>,
    icon: Home,
    tooltip: "Home",
    url: "/dashboard",
    disabled: false,
  },
  {
    id: "new-tenders",
    title: <span>Discover new tenders</span>,
    icon: SparklesIcon,
    tooltip: "Discover new tenders",
    url: "/dashboard/inbox",
    disabled: false,
  },
  {
    id: "active-tenders",
    title: <span>Active tenders</span>,
    icon: FolderOpen,
    tooltip: "Active tenders",
    url: "/dashboard/tenders",
    disabled: false,
  },
  {
    id: "documents",
    title: <span>Documents</span>,
    icon: FileCheck,
    tooltip: "Documents",
    url: "/dashboard/documents",
    disabled: true,
  },
  {
    id: "products",
    title: <span>My product catalog</span>,
    icon: Package,
    tooltip: "Products",
    url: "/dashboard/products",
    disabled: true,
  },
] as const;

export type SidebarItemId = (typeof navigationItems)[number]["id"];

export default function DashboardSidebar() {
  const { sidebarPopups } = useSidebarPopupStore();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
      <SidebarHeader className="group-data-[state=collapsed]:px-0 p-4">
        <div className="flex group-data-[state=collapsed]:flex-center items-center gap-2">
          <SidebarLogo />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const popup = sidebarPopups.find((p) => p.id === item.id);
                const isActive = pathname.endsWith(item.url) || Boolean(popup);

                return (
                  <SidebarMenuItem key={item.url} className="relative">
                    <Tooltip open={Boolean(popup)}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.tooltip}
                          isActive={isActive}
                          aria-disabled={item.disabled}
                        >
                          <Link href={item.disabled ? "#" : item.url}>
                            <item.icon
                              className={cn(isActive && "text-primary")}
                            />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {popup?.content && (
                        <TooltipContent
                          side="right"
                          align="start"
                          className="max-w-xs"
                        >
                          <div className="text-sm">{popup?.content}</div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLogOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
