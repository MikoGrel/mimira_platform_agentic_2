"use client";

import { BentoCard } from "$/components/ui/bento-card";
import MiniTenderCalendar from "$/features/tenders/components/mini-tender-calendar";
import { useState } from "react";
import { useExpiringTenders } from "../api";
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Button, ButtonGroup } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { truncate } from "lodash-es";

interface DeadlineCalendarBentoProps {
  className?: string;
}

export function DeadlineCalendarBento({
  className,
}: DeadlineCalendarBentoProps) {
  const [month, setMonth] = useState<Date>(new Date());
  const { readableMonth } = useDateFormat();

  const { data: tenders, isLoading } = useExpiringTenders({
    from: startOfMonth(month),
    to: endOfMonth(month),
  });

  function handleNextMonth() {
    setMonth(addMonths(month, 1));
  }

  function handlePreviousMonth() {
    setMonth(subMonths(month, 1));
  }

  return (
    <BentoCard
      loading={isLoading}
      title={<span>Deadline calendar {readableMonth(month)}</span>}
      titleExtra={
        <ButtonGroup size="sm" className="rounded-md p-1 bg-muted">
          <Button
            isIconOnly
            onPress={handlePreviousMonth}
            variant="shadow"
            className="bg-background border border-r-0 px-2"
            fullWidth
          >
            <ChevronLeft />
          </Button>
          <Button
            isIconOnly
            onPress={handleNextMonth}
            variant="shadow"
            className="bg-background border px-2"
          >
            <ChevronRight />
          </Button>
        </ButtonGroup>
      }
      className={className}
      bodyClassName="lg:p-0 lg:pr-3"
    >
      <MiniTenderCalendar
        month={month}
        onMonthChange={setMonth}
        expiringTenders={tenders?.map((tender) => ({
          id: tender.id,
          expiresAt: new Date(tender.tenders.submitting_offers_date!),
          title: truncate(tender.tenders.order_object!, { length: 40 }),
        }))}
      />
    </BentoCard>
  );
}
