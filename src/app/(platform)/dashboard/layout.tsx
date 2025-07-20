import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "$/features/shared/ui/sidebar";
import { Input } from "$/features/shared/ui/input";
import { Search } from "lucide-react";
import { createClient } from "$/lib/supabase/server";
import { LocaleSwitcher } from "lingo.dev/react-client";
import { DashboardSidebar } from "$/features/navigation/components";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  return (
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-sidebar px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/70" />
            <Input
              placeholder="Search..."
              className="w-64 pl-8 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/70"
            />
          </div>

          <div className="flex items-center gap-4">
            <LocaleSwitcher locales={["pl", "en"]} />

            <div className="flex items-center gap-2">
              {user && <span>{user.email}</span>}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 rounded-tl-2xl border-l border-t border-sidebar-border">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
