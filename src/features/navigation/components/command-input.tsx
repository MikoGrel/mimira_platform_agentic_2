"use client";

import { Search } from "lucide-react";
import { Input } from "$/components/ui/input";
import { Kbd } from "@heroui/react";
import { useCommandStore } from "../store/use-command-store";

export function CommandInput() {
  const { setCommandOpen } = useCommandStore();

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/70" />
      <Input
        onFocus={() => setCommandOpen(true)}
        placeholder="Search..."
        className="w-64 pl-8 bg-background border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/70"
      />
      <Kbd
        keys={["command"]}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        J
      </Kbd>
    </div>
  );
}
