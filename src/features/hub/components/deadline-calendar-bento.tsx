"use client";

import { BentoCard } from "$/components/ui/bento-card";
import MiniTenderCalendar from "$/features/tenders/components/mini-tender-calendar";
import { useTenderInboxQuery } from "$/features/inbox";

interface DeadlineCalendarBentoProps {
  className?: string;
}

export function DeadlineCalendarBento({
  className,
}: DeadlineCalendarBentoProps) {
  const { tenders, loading } = useTenderInboxQuery({ pageSize: 3 });

  return (
    <BentoCard
      loading={loading}
      title={<span>Deadline calendar</span>}
      className={className}
      bodyClassName="lg:p-0 lg:pr-3"
    >
      <MiniTenderCalendar
        expiringTenders={tenders?.map((tender) => ({
          id: tender.id,
          expiresAt: new Date(tender.submittingoffersdate!),
          title: tender.orderobject!,
        }))}
      />
    </BentoCard>
  );
}
