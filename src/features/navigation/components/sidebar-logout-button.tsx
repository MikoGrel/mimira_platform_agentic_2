"use client";

import { useSidebar } from "$/components/ui/sidebar";
import { logout } from "$/features/auth/actions";
import { Button } from "@heroui/react";
import { LogOut } from "lucide-react";

export function SidebarLogOutButton() {
  const { open } = useSidebar();

  return (
    <form action={logout} className="w-full">
      <Button
        fullWidth
        type="submit"
        variant="light"
        startContent={<LogOut className="w-4 h-4" />}
        isIconOnly={!open}
      >
        {open && <span>Sign Out</span>}
      </Button>
    </form>
  );
}
