"use client";

import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-foreground border-b border-border pb-3">
      {children}
    </h2>
  );
}
