"use client";

import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { Chip, Button } from "@heroui/react";
import { ArrowUpRight, CalendarClock, Star } from "lucide-react";
import Link from "$/components/ui/link";
import { motion } from "motion/react";
import { truncate } from "lodash-es";
import { cn } from "$/lib/utils";

interface TenderMiniCardProps {
  title: string;
  organization: string;
  expirationDate: Date;
  id: string;
  index?: number;
  hasOffersDateChanged?: boolean;
  markedAsFavorite?: boolean;
  onMarkAsFavorite?: (id: string, value: boolean) => void;
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
    markedAsFavorite = false,
    onMarkAsFavorite,
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
      <div className="relative group bg-background hover:bg-muted transition-all border rounded-xl">
        <Link
          href={`/dashboard/inbox/?id=${id}`}
          className="p-4 flex justify-between"
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">
              {markedAsFavorite && (
                <Star className="w-3.5 h-3.5 stroke-0 fill-yellow-500 inline mb-0.5 mr-1" />
              )}
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
        {onMarkAsFavorite && (
          <Button
            onPress={() => onMarkAsFavorite(id, !markedAsFavorite)}
            isIconOnly
            variant="flat"
            color="default"
            size="sm"
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm z-10"
          >
            <Star
              className={cn("w-4 h-4 stroke-[1.5]", {
                "fill-yellow-500 stroke-0": markedAsFavorite,
              })}
            />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
