"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StatusBadge } from "./ui-components";

// Requirements List Component
export function RequirementsList({
  title,
  items,
  type,
  collapsed: initiallyCollapsed = false,
}: {
  title: string;
  items: string[];
  type: "success" | "warning" | "error";
  collapsed?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  if (!items || items.length === 0) return null;

  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="space-y-2">
      <button
        onClick={toggleCollapsed}
        className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        {title}
        <span className="text-muted-foreground">({items.length})</span>
      </button>

      {!isCollapsed && (
        <div className="space-y-1">
          {items.map((item, index) => (
            <StatusBadge key={index} type={type}>
              {String(item)}
            </StatusBadge>
          ))}
        </div>
      )}
    </div>
  );
}
