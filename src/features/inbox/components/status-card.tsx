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
  type?: "success" | "warning" | "error" | "neutral";
}) {
  const badgeColors = {
    success: "bg-emerald-50 text-emerald-600 border-emerald-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    error: "bg-red-50 text-red-600 border-red-200",
    neutral: "bg-gray-50 text-gray-600 border-gray-200",
  } as const;

  return (
    <Card
      shadow="none"
      className="border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
    >
      <CardBody className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center justify-center w-6 h-6 rounded-full border flex-shrink-0",
                badgeColors[type]
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            {title}
          </p>
        </div>
        {children && (
          <div className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">
            {children}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
