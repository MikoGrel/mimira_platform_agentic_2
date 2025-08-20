"use client";

import { useState, useMemo } from "react";
import { Calendar } from "$/components/ui/calendar";
import Link from "$/components/ui/link";

type ExpiringTender = {
  id: string;
  title: string;
  expiresAt: Date;
};

interface MiniTenderCalendarProps {
  expiringTenders?: ExpiringTender[];
  month?: Date;
  onMonthChange?: (date: Date) => void;
}

export default function MiniTenderCalendar({
  expiringTenders = [],
  month,
  onMonthChange,
}: MiniTenderCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Create a map of dates to tenders for quick lookup
  const tendersByDate = useMemo(() => {
    const dateMap = new Map<string, ExpiringTender[]>();

    expiringTenders.forEach((tender) => {
      const dateKey = tender.expiresAt.toDateString();
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(tender);
    });

    return dateMap;
  }, [expiringTenders]);

  // Get dates that have expiring tenders
  const datesWithTenders = useMemo(() => {
    return expiringTenders.map((tender) => tender.expiresAt);
  }, [expiringTenders]);

  // Get tenders for the selected date
  const selectedDateTenders = useMemo(() => {
    if (!selectedDate) return [];
    return tendersByDate.get(selectedDate.toDateString()) || [];
  }, [selectedDate, tendersByDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <div className="grid grid-cols-[1fr_1fr] grid-rows-1 gap-4">
      <Calendar
        defaultMonth={new Date()}
        month={month}
        onMonthChange={onMonthChange}
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        modifiers={{
          hasTenders: datesWithTenders,
        }}
        modifiersClassNames={{
          hasTenders:
            "bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-100 dark:hover:bg-orange-900/30 rounded-md",
        }}
        className="w-full h-full p-0"
        components={{
          Nav: () => <span className="hidden" />,
          MonthCaption: () => <span className="hidden" />,
          Weekdays: () => <></>,
        }}
        showOutsideDays={false}
      />
      <div className="bg-accent p-4 rounded-lg">
        {selectedDate ? (
          <div>
            <p className="font-semibold text-sm mb-2">
              {selectedDate.toLocaleDateString()}
            </p>
            {selectedDateTenders.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground mb-2">
                  Expiring Tenders:
                </p>
                <ul className="space-y-1">
                  {selectedDateTenders.map((tender) => (
                    <li
                      key={tender.id}
                      className="text-xs p-2 bg-background rounded-md border group"
                    >
                      <Link
                        href={`/dashboard/inbox?id=${tender.id}`}
                        className="group-hover:text-primary"
                      >
                        {tender.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No tenders expiring on this date
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold mb-2">Select a date</p>
            <p className="text-xs text-muted-foreground">
              Click on highlighted dates to see expiring tenders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
