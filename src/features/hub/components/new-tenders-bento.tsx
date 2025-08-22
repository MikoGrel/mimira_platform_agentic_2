"use client";

import { Button } from "@heroui/react";
import Link from "$/components/ui/link";
import { BentoCard } from "$/components/ui/bento-card";
import { TenderMiniCard } from "$/features/tenders/components/tender-mini-card";
import { cn } from "$/lib/utils";
import { AnimatePresence } from "motion/react";
import useTenderInboxQuery from "$/features/inbox/api/use-tender-inbox-query";

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
        <div className="h-full overflow-y-auto space-y-4 scrollbar-hide pr-2">
          {tenders?.map((tender, index) => (
            <TenderMiniCard
              key={tender.id}
              index={index}
              id={tender.id}
              title={tender.tenders?.order_object ?? ""}
              organization={tender.tenders?.organization_name ?? ""}
              expirationDate={
                new Date(tender.tenders?.submitting_offers_date ?? "")
              }
            />
          ))}
        </div>
      </AnimatePresence>
    </BentoCard>
  );
}
