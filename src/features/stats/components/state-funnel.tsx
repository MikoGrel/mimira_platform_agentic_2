"use client";

import { ReactNode } from "react";

export function StateFunnel() {
  return (
    <div className="space-y-2">
      <FunnelItem title={<span>Found</span>} value={10} maxValue={100} />
      <FunnelItem title={<span>Qualified</span>} value={10} maxValue={100} />
      <FunnelItem title={<span>Applied</span>} value={10} maxValue={100} />
      <FunnelItem title={<span>Won</span>} value={10} maxValue={100} />
      <FunnelItem title={<span>Lost</span>} value={10} maxValue={100} />
    </div>
  );
}

interface FunnelItemProps {
  title: ReactNode;
  value: number;
  maxValue: number;
}

export function FunnelItem({ title, value, maxValue }: FunnelItemProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="grid grid-cols-[1fr_auto] grid-rows-2 items-center text-sm">
      <div className="font-medium">{title}</div>
      <div className="flex items-center gap-2">
        <p>{value}</p>
        <p>({percentage}%)</p>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full col-span-2">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
