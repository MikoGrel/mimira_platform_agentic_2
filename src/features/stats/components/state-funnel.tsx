"use client";

import { cn } from "$/lib/utils";
import { ReactNode } from "react";

export function StateFunnel() {
  return (
    <div>
      <div className="space-y-1">
        <FunnelItem title={<span>Found</span>} value={100} maxValue={100} />
        <FunnelItem
          className="bg-amber-500"
          title={<span>Qualified for</span>}
          value={80}
          maxValue={100}
        />
        <FunnelItem
          className="bg-sky-500"
          title={<span>Applied to</span>}
          value={50}
          maxValue={80}
        />
        <FunnelItem
          className="bg-green-500"
          title={<span>Won</span>}
          value={20}
          maxValue={50}
        />
        <FunnelItem
          className="bg-red-500"
          title={<span>Lost</span>}
          value={10}
          maxValue={20}
        />
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        <p className="flex justify-between">
          <span className="font-medium">Total deals:</span> 50
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Conversion rate:</span> 10%
        </p>
      </div>
    </div>
  );
}

interface FunnelItemProps {
  title: ReactNode;
  value: number;
  maxValue: number;
  className?: string;
}

export function FunnelItem({
  title,
  value,
  maxValue,
  className,
}: FunnelItemProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="grid grid-cols-[1fr_auto] grid-rows-2 items-center text-sm">
      <div className="font-medium">{title}</div>
      <div className="flex items-center gap-1">
        <p className="font-medium">{value}</p>
        <p className="text-muted-foreground">({percentage}%)</p>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full col-span-2">
        <div
          className={cn("h-full bg-blue-500 rounded-full", className)}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
