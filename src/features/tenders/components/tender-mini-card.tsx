import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { Chip } from "@heroui/react";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import Link from "next/link";

interface TenderMiniCardProps {
  title: string;
  amount: number;
  expirationDate: Date;
  id: string;
}

export function TenderMiniCard(props: TenderMiniCardProps) {
  const { relativeToNow } = useDateFormat();
  const { title, expirationDate, id } = props;

  const timeUntilExpiration = relativeToNow(expirationDate);

  return (
    <Link
      href={`/dashboard/inbox/?id=${id}`}
      className="bg-white hover:bg-gray-50 transition-all group border p-4 flex justify-between rounded-xl"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{title}</p>
        <div className="text-xs flex gap-4">
          <Chip
            variant="flat"
            startContent={<CalendarClock className="w-4 h-4 ml-1" />}
          >
            {timeUntilExpiration}
          </Chip>
        </div>
      </div>
      <div className="h-full ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
        <ArrowUpRight strokeWidth={1.5} />
      </div>
    </Link>
  );
}
