"use client";

import { Home, SparklesIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "$/features/shared/ui/command";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const goToPage = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tenders, navigate, or run commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => goToPage("/dashboard")}>
              <Home />
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => goToPage("/dashboard/inbox")}>
              <SparklesIcon />
              <span>Discover New Tenders</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
