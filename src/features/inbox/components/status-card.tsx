"use client";

import { cn } from "$/lib/utils";
import { Card, CardBody } from "@heroui/react";
import type { ReactNode } from "react";

export function StatusCard({
  icon: Icon,
  title,
  children,
  type = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children?: ReactNode;
  type?: "success" | "warning" | "error" | "neutral" | "info";
}) {
  const badgeColors = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-subtle text-foreground/70 border-border",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  } as const;

  return (
    <Card
      shadow="none"
      className="border border-border rounded-lg hover:shadow-sm transition-shadow"
    >
      <CardBody className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center justify-center w-6 h-6 rounded-full border flex-shrink-0",
                badgeColors[type]
              )}
            >
              <Icon className="w-4 h-4" />
            </span>
            {title}
          </p>
        </div>
        {children && (
          <div className="text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed">
            {children}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
