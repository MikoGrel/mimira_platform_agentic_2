"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { BentoCard } from "$/components/ui/bento-card";
import { TenderMiniCard } from "$/features/tenders/components/tender-mini-card";
import { useTenderInboxQuery } from "$/features/inbox/api";
import { cn } from "$/lib/utils";
import { AnimatePresence } from "motion/react";

interface NewTendersBentoProps {
  className?: string;
}

export function NewTendersBento({ className }: NewTendersBentoProps) {
  const { tenders, loading } = useTenderInboxQuery({ pageSize: 3 });

  return (
    <BentoCard
      loading={loading}
      title={<span>New tenders</span>}
      titleExtra={
        <Button as={Link} href="/dashboard/inbox" variant="light" size="sm">
          Open full list
        </Button>
      }
      className={cn("pb-0", className)}
      bodyClassName="lg:pb-0"
    >
      <AnimatePresence>
        <div className="h-full overflow-y-auto space-y-4 scrollbar-hide pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tenders?.map((tender, index) => (
            <TenderMiniCard
              key={tender.id}
              index={index}
              id={tender.id}
              title={tender.orderobject!}
              organization={tender.organizationname!}
              expirationDate={new Date(tender.submittingoffersdate!)}
            />
          ))}
        </div>
      </AnimatePresence>
    </BentoCard>
  );
}
