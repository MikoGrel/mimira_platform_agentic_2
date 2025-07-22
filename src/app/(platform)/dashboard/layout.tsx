import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "$/features/shared/ui/sidebar";
import { Input } from "$/features/shared/ui/input";
import { Search, User } from "lucide-react";
import { LocaleSwitcher } from "lingo.dev/react-client";
import { DashboardSidebar } from "$/features/navigation/components";
import { DashboardCommand } from "$/features/navigation/components/dashboard-command";
import UserName from "$/features/auth/components/user-name";
import { Kbd } from "@heroui/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <DashboardCommand />

      <SidebarInset className="flex flex-col h-screen">
        <header className="grid grid-cols-3 grid-rows-1 h-16 shrink-0  gap-4 bg-sidebar px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>

          <div className="relative flex flex-center">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/70" />
              <Input
                placeholder="Search..."
                className="w-64 pl-8 bg-white border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/70"
              />
              <Kbd
                keys={["command"]}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                J
              </Kbd>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end">
            <LocaleSwitcher locales={["pl", "en"]} />
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full border">
              <User className="w-5 h-5" />
              <UserName />
            </div>
          </div>
        </header>
        <div className="flex-1 rounded-tl-2xl border-l border-t border-sidebar-border overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
