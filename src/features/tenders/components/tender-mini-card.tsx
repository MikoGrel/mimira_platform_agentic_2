"use client";

import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { Chip } from "@heroui/react";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import Link from "$/components/ui/link";
import { motion } from "motion/react";
import { truncate } from "lodash-es";

interface TenderMiniCardProps {
  title: string;
  organization: string;
  expirationDate: Date;
  id: string;
  index?: number;
  hasOffersDateChanged?: boolean;
}

export function TenderMiniCard(props: TenderMiniCardProps) {
  const { relativeToNow } = useDateFormat();
  const {
    title,
    organization,
    expirationDate,
    id,
    index = 0,
    hasOffersDateChanged = false,
  } = props;

  const timeUntilExpiration = relativeToNow(expirationDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      <Link
        href={`/dashboard/inbox/?id=${id}`}
        className="bg-background hover:bg-muted transition-all group border p-4 flex justify-between rounded-xl"
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            {truncate(title, { length: 150 })}
          </p>
          <div className="text-sm flex items-center gap-2">
            <Chip
              variant="flat"
              color={hasOffersDateChanged ? "warning" : "default"}
              startContent={<CalendarClock className="w-4 h-4 ml-1" />}
            >
              {hasOffersDateChanged && <span>New term:&nbsp;</span>}
              {timeUntilExpiration}
            </Chip>
            <span className="block text-muted-foreground">
              {truncate(organization, { length: 50 })}
            </span>
          </div>
        </div>
        <div className="h-full ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
          <ArrowUpRight
            strokeWidth={1.5}
            className="text-muted-foreground group-hover:text-primary transition-all"
          />
        </div>
      </Link>
    </motion.div>
  );
}
