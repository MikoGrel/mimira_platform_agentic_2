import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "$/components/ui/sidebar";
import { LocaleSwitcher } from "$/features/i18n/components/LocaleSwitcher";
import { DashboardSidebar } from "$/features/navigation/components";
import { DashboardCommand } from "$/features/navigation/components/dashboard-command";
import UserMenu from "$/features/auth/components/user-menu";
import { cookies } from "next/headers";
import { CommandInput } from "$/features/navigation/components/command-input";
import AuthGuard from "$/features/auth/components/auth-guard";

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
      <AuthGuard />

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
            <UserMenu />
          </div>
        </header>
        <div className="flex-1 rounded-tl-2xl border-l border-t border-sidebar-border overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
