"use client";

import { cn } from "$/lib/utils";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { ReactNode } from "react";

export function StatusBadge({
  type,
  children,
}: {
  type: "success" | "warning" | "error" | "neutral";
  children: ReactNode;
}) {
  const badgeColors = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-subtle text-foreground/70 border-border",
  } as const;

  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
    neutral: Clock,
  } as const;

  const Icon = icons[type];

  return (
    <div className={cn("flex gap-2 px-3 py-2 rounded-lg text-sm")}>
      <div
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full border flex-shrink-0 -mt-0.5",
          badgeColors[type]
        )}
      >
        <Icon className={cn("w-4 h-4")} />
      </div>
      {children}
    </div>
  );
}
