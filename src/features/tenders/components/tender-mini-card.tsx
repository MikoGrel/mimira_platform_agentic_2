import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { Button } from "@heroui/react";
import { CalendarClock, DollarSign, MoveRight } from "lucide-react";

interface TenderMiniCardProps {
  title: string;
  amount: number;
  expirationDate: Date;
  id: string;
}

export function TenderMiniCard(props: TenderMiniCardProps) {
  const { relativeToNow } = useDateFormat();
  const { title, amount, expirationDate, id } = props;

  const formattedAmount = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);

  const timeUntilExpiration = relativeToNow(expirationDate);

  return (
    <div className="bg-white border p-4 flex justify-between rounded-xl">
      <div className="flex flex-col gap-2">
        <p>{title}</p>
        <div className="text-xs flex gap-4">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {formattedAmount}
          </div>
          <div className="flex items-center gap-1">
            <CalendarClock className="w-4 h-4" />
            {timeUntilExpiration}
          </div>
        </div>
      </div>
      <div className="h-full ml-4">
        <Button
          href={`/tenders/${id}`}
          variant="bordered"
          className="border-1"
          isIconOnly
        >
          <MoveRight />
        </Button>
      </div>
    </div>
  );
}
