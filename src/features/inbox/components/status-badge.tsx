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
  const styles = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-gray-50 text-gray-700 border-gray-200",
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
      <Icon className={cn("w-4 h-4 flex-shrink-0", styles[type])} />
      {children}
    </div>
  );
}
