"use client";

import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
      {children}
    </h2>
  );
}
