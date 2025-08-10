"use client";

import { cn } from "$/lib/utils";

export function InfoCard({
  title,
  content,
  variant = "default",
}: {
  title: string;
  content: string;
  variant?: "default" | "highlight";
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        variant === "highlight"
          ? "bg-blue-50 border-blue-200"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <h4 className="text-sm font-medium text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  );
}
