"use client";

import { StatusBadge } from "./ui-components";

// Requirements List Component
export function RequirementsList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "success" | "warning" | "error";
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <StatusBadge key={index} type={type}>
            {String(item)}
          </StatusBadge>
        ))}
      </div>
    </div>
  );
} 