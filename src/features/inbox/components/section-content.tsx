"use client";

import { cn } from "$/lib/utils";
import type { ReactNode } from "react";

export function SectionContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}
