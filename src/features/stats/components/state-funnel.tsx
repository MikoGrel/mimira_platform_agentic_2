"use client";

import { cn } from "$/lib/utils";
import { ReactNode } from "react";
import { useStatusCounts } from "../api/use-status-counts";
import { floor } from "lodash-es";
import { MappingStatus } from "$/features/tenders/constants/status";

export function StateFunnel() {
  const { data: statusCounts } = useStatusCounts();

  const analysed =
    statusCounts?.reduce((acc, count) => acc + count.count, 0) || 0;
  const confirmedApplication =
    statusCounts
      ?.filter((c) =>
        [
          MappingStatus.analysis,
          MappingStatus.documents_preparing,
          MappingStatus.questions_answered,
          MappingStatus.documents_ready,
          MappingStatus.questions,
        ].includes(c.status)
      )
      .reduce((acc, count) => acc + count.count, 0) || 0;

  const preparingOffer =
    statusCounts
      ?.filter((c) =>
        [
          MappingStatus.documents_preparing,
          MappingStatus.questions_answered,
          MappingStatus.documents_ready,
          MappingStatus.questions,
        ].includes(c.status)
      )
      .reduce((acc, count) => acc + count.count, 0) || 0;
  const applied =
    statusCounts
      ?.filter((c) => c.status === MappingStatus.decision_made_applied)
      .reduce((acc, count) => acc + count.count, 0) || 0;
  const won =
    statusCounts
      ?.filter((c) => c.status === MappingStatus.won)
      .reduce((acc, count) => acc + count.count, 0) || 0;

  return (
    <div>
      <div className="space-y-1">
        <FunnelItem
          title={<span>Analysed</span>}
          value={analysed}
          maxValue={analysed}
        />
        <FunnelItem
          className="bg-amber-500"
          title={<span>Confirmed application</span>}
          value={confirmedApplication}
          maxValue={analysed}
        />
        <FunnelItem
          className="bg-orange-500"
          title={<span>Preparing an offer</span>}
          value={preparingOffer}
          maxValue={analysed}
        />
        <FunnelItem
          className="bg-sky-500"
          title={<span>Applied</span>}
          value={applied}
          maxValue={analysed}
        />
        <FunnelItem
          className="bg-green-500"
          title={<span>Won</span>}
          value={won}
          maxValue={analysed}
        />
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        <p className="flex justify-between">
          <span className="font-medium">Total number of tenders:</span>{" "}
          {analysed}
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
