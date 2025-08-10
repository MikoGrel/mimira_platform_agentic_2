"use client";

import { cn } from "$/lib/utils";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

// Section wrapper component
export function Section({
  children,
  className,
  id,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
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

// Section title component
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
      {children}
    </h2>
  );
}

// Section content wrapper
export function SectionContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

// Status badge component
export function StatusBadge({
  type,
  children,
}: {
  type: "success" | "warning" | "error" | "neutral";
  children: React.ReactNode;
}) {
  const styles = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
    neutral: Clock,
  };

  const Icon = icons[type];

  return (
    <div className={cn("flex gap-2 px-3 py-2 rounded-lg text-sm")}>
      <Icon className={cn("w-4 h-4 flex-shrink-0", styles[type])} />
      {children}
    </div>
  );
}

// Info card component
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

// Status card component
export function StatusCard({
  icon: Icon,
  title,
  value,
  type = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  type?: "success" | "warning" | "error" | "neutral";
}) {
  const iconColors = {
    success: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <Icon
          className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconColors[type])}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-sm font-medium text-gray-900 leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
