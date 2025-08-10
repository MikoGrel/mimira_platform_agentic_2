"use client";

import { cn } from "$/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Section({
  children,
  className,
  id,
  ...props
}: {
  children: ReactNode;
  className?: string;
  id?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      id={id}
      className={cn("scroll-mt-6 space-y-4 overflow-x-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}
