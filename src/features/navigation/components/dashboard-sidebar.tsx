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
import { Home, FolderOpen, SparklesIcon, FileCheck } from "lucide-react";
import SidebarLogo from "./sidebar-logo";
import Link from "next/link";
import { SidebarLogOutButton } from "./sidebar-logout-button";
import { usePathname } from "next/navigation";
import { cn } from "$/lib/utils";

const navigationItems = [
  {
    title: <span>Home</span>,
    icon: Home,
    tooltip: "Home",
    url: "/dashboard",
  },
  {
    title: <span>Discover new tenders</span>,
    icon: SparklesIcon,
    tooltip: "Discover new tenders",
    url: "/dashboard/inbox",
  },
  {
    title: <span>Active tenders</span>,
    icon: FolderOpen,
    tooltip: "Active tenders",
    url: "/dashboard/projects",
  },
  {
    title: <span>Documents</span>,
    icon: FileCheck,
    tooltip: "Documents",
    url: "/dashboard/team",
  },
];

export default function DashboardSidebar() {
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
                const isActive = pathname.endsWith(item.url);

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.tooltip}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <item.icon className={cn(isActive && "text-primary")} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
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
