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
} from "$/features/shared/ui/sidebar";
import {
  Home,
  FolderOpen,
  LogOut,
  SparklesIcon,
  FileCheck,
} from "lucide-react";
import { Button } from "@heroui/react";
import { logout } from "$/features/auth/actions";
import SidebarLogo from "./sidebar-logo";

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
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.tooltip}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <form className="w-full">
              <Button
                fullWidth
                type="submit"
                formAction={logout}
                variant="flat"
                startContent={<LogOut className="w-4 h-4" />}
              >
                <span>Sign Out</span>
              </Button>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
