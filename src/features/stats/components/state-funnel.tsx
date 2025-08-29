"use client";

import { cn } from "$/lib/utils";
import { ReactNode } from "react";
import { useStatusCounts } from "../api/use-status-counts";
import { floor } from "lodash-es";

export function StateFunnel() {
  const { data: statusCounts } = useStatusCounts();

  const total = statusCounts?.reduce((acc, count) => acc + count.count, 0) || 0;
  const qualified =
    statusCounts
      ?.filter((c) => c.status === "default")
      .reduce((acc, count) => acc + count.count, 0) || 0;
  const inProgress =
    statusCounts
      ?.filter((c) =>
        ["analysis", "documents_preparing", "questions_answered"].includes(
          c.status
        )
      )
      .reduce((acc, count) => acc + count.count, 0) || 0;
  const won =
    statusCounts
      ?.filter((c) => c.status === "won")
      .reduce((acc, count) => acc + count.count, 0) || 0;
  const lost =
    statusCounts
      ?.filter((c) => c.status === "lost")
      .reduce((acc, count) => acc + count.count, 0) || 0;

  const wonPercentage = floor((won / total) * 100, 1);

  return (
    <div>
      <div className="space-y-1">
        <FunnelItem
          title={<span>Qualified</span>}
          value={total}
          maxValue={total}
        />
        <FunnelItem
          className="bg-amber-500"
          title={<span>Waiting for application</span>}
          value={qualified}
          maxValue={total}
        />
        <FunnelItem
          className="bg-sky-500"
          title={<span>In progress</span>}
          value={inProgress}
          maxValue={total}
        />
        <FunnelItem
          className="bg-green-500"
          title={<span>Won</span>}
          value={won}
          maxValue={total}
        />
        <FunnelItem
          className="bg-red-500"
          title={<span>Lost</span>}
          value={lost}
          maxValue={total}
        />
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        <p className="flex justify-between">
          <span className="font-medium">Total deals:</span> {won}
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Conversion rate:</span> {wonPercentage}%
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

function FunnelItem({ title, value, maxValue, className }: FunnelItemProps) {
  const percentage = floor((value / maxValue) * 100, 1);

  return (
    <div className="grid grid-cols-[1fr_auto] grid-rows-2 items-center text-sm">
      <div className="font-medium">{title}</div>
      <div className="flex items-center gap-1">
        <p className="font-medium">{value}</p>
        <p className="text-muted-foreground">({percentage}%)</p>
      </div>
      <div className="w-full h-2 bg-muted rounded-full col-span-2">
        <div
          className={cn("h-full bg-primary rounded-full", className)}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
