"use client";

import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm text-muted-foreground font-medium">{children}</h2>
  );
}
