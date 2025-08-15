"use client";

import { Home, SparklesIcon, Loader2, Scroll } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "$/components/ui/command";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCommandSearch } from "../api/use-command-search";
import { truncate } from "lodash";
import { useDebouncedValue } from "$/hooks/use-debounced-value";
import { useCommandStore } from "../store/use-command-store";

export function DashboardCommand() {
  const { commandOpen: open, setCommandOpen: setOpen } = useCommandStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const { data: tenders, isFetching } = useCommandSearch(debouncedSearch);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen, open]);

  const goToPage = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search tenders, navigate, or run commands..."
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading={<span>Navigation</span>}>
            <CommandItem onSelect={() => goToPage("/dashboard")}>
              <Home />
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => goToPage("/dashboard/inbox")}>
              <SparklesIcon />
              <span>Discover New Tenders</span>
            </CommandItem>
          </CommandGroup>
          {(isFetching || (tenders && tenders.length > 0)) && (
            <CommandGroup heading={<span>Tenders</span>}>
              {isFetching && (
                <CommandItem disabled>
                  <Loader2 className="animate-spin" />
                  <span>Searching…</span>
                </CommandItem>
              )}
              {tenders?.map((tender) => (
                <CommandItem
                  key={tender.id}
                  value={tender.id}
                  onSelect={(id: string) => {
                    const tender = tenders.find((t) => t.id === id);

                    if (tender?.status === "default") {
                      goToPage("/dashboard/inbox?id=" + id);
                    } else {
                      goToPage("/dashboard/tenders?id=" + id);
                    }
                  }}
                >
                  <Scroll />
                  <span>
                    {truncate(tender.orderobject ?? "", { length: 60 })}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
