"use client";

import { AnimatedSymbol } from "$/features/branding/components";
import { cn } from "$/lib/utils";

export function EmptyInboxMessage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "m-4 flex flex-center flex-col gap-2 bg-sidebar border border-sidebar-border p-6 rounded-lg text-center",
        className
      )}
    >
      <AnimatedSymbol className="w-8 h-8 text-primary" />
      <p className="text-sm w-4/5">
        We are constantly searching for tenders for you. If we find new ones,
        you will be notified by email.
      </p>
    </div>
  );
}
