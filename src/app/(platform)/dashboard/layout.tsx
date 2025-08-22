import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "$/components/ui/sidebar";
import { User } from "lucide-react";
import { LocaleSwitcher } from "$/features/i18n/components/LocaleSwitcher";
import { DashboardSidebar } from "$/features/navigation/components";
import { DashboardCommand } from "$/features/navigation/components/dashboard-command";
import UserName from "$/features/auth/components/user-name";
import { cookies } from "next/headers";
import { CommandInput } from "$/features/navigation/components/command-input";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarState = (await cookies()).get("sidebar_state");

  return (
    <SidebarProvider defaultOpen={sidebarState?.value === "true"}>
      <DashboardSidebar />
      <DashboardCommand />

      <SidebarInset className="flex flex-col h-screen">
        <header className="grid grid-cols-3 grid-rows-1 h-16 shrink-0  gap-4 bg-sidebar px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>

          <div className="relative flex flex-center">
            <CommandInput />
          </div>

          <div className="flex items-center gap-4 justify-end">
            <LocaleSwitcher locales={["pl", "en"]} />
            <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-full border">
              <User className="w-5 h-5" />
              <UserName />
            </div>
          </div>
        </header>
        <div className="flex-1 rounded-tl-2xl border-l border-t border-sidebar-border overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
