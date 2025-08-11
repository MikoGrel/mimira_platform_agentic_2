"use client";

import { cn } from "$/lib/utils";
import { ReactNode } from "react";

export function InfoCard({
  title,
  content,
  variant = "default",
}: {
  title: string;
  content: ReactNode;
  variant?: "default" | "highlight";
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        variant === "highlight"
          ? "bg-primary/5 border-primary/20"
          : "bg-subtle/30 border-border"
      )}
    >
      <h4 className="text-sm font-medium text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  );
}
