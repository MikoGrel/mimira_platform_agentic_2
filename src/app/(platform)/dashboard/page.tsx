"use client";

import { Button, Checkbox } from "@heroui/react";
import Symbol from "$/features/branding/components/Symbol";
import { MoveRight } from "lucide-react";
import MiniTenderCalendar from "$/features/tenders/components/mini-tender-calendar";
import { TenderMiniCard } from "$/features/tenders/components/tender-mini-card";
import { BentoCard } from "$/components/ui/bento-card";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import Link from "next/link";
import { StateFunnel } from "$/features/stats/components/state-funnel";

export default function DashboardPage() {
  const client = createClient();
  const { data: tenders, isLoading } = useQuery({
    queryKey: ["home-tenders"],
    queryFn: async () =>
      await client
        .from("tenders")
        .select("*")
        .order("submittingoffersdate", { ascending: false })
        .limit(3),
  });

  return (
    <main className="max-w-4xl mx-auto flex flex-col gap-6 p-4 lg:pt-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col-reverse lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold font-heading">Welcome back</h1>
        </div>
        <p className="max-w-[75%] text-muted-foreground">
          Today&apos;s briefing: Since yesterday we&apos;ve managed to find you
          5 new tenders, 3 require your attention.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-rows-[380px_320px] lg:grid-cols-6 gap-6">
        <BentoCard
          loading={isLoading}
          title={<span>New tenders</span>}
          titleExtra={
            <Button as={Link} href="/inbox" variant="light" size="sm">
              Open full list
            </Button>
          }
          className="lg:col-start-1 lg:col-end-5 pb-0"
          bodyClassName="lg:pb-0"
        >
          <div className="h-full overflow-y-auto space-y-4 scrollbar-hide pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tenders?.data?.map((tender) => (
              <TenderMiniCard
                key={tender.id}
                id={tender.id}
                title={tender.orderobject!}
                amount={10_000}
                expirationDate={new Date(tender.submittingoffersdate!)}
              />
            ))}
          </div>
        </BentoCard>
        <BentoCard
          loading={isLoading}
          title={<div>Stats</div>}
          className="lg:col-start-5 lg:col-end-7 relative overflow-hidden"
        >
          <StateFunnel />
          <div className="mt-2 text-sm text-muted-foreground">
            <p className="flex justify-between">
              <span className="font-medium">Total deals:</span> 50
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Conversion rate:</span> 10%
            </p>
            <p></p>
          </div>
        </BentoCard>
        <BentoCard
          loading={isLoading}
          title={<span>Return to last tender</span>}
          className="lg:col-start-1 lg:col-end-4"
          bodyClassName="flex flex-col gap-4"
        >
          <p className="text-lg font-medium">Restocking medical equipment</p>
          <ul className="space-y-2">
            <li>
              <Checkbox readOnly isSelected>
                Preview
              </Checkbox>
            </li>
            <li>
              <Checkbox readOnly isSelected>
                Filling-out data
              </Checkbox>
            </li>
            <li>
              <Checkbox isDisabled>Application</Checkbox>
            </li>
          </ul>
          <Button color="primary" endContent={<MoveRight />}>
            Continue
          </Button>
        </BentoCard>
        <BentoCard
          loading={isLoading}
          title={<span>Deadline calendar</span>}
          className="lg:col-start-4 lg:col-end-7"
          bodyClassName="lg:p-0"
        >
          <MiniTenderCalendar
            expiringTenders={tenders?.data?.map((tender) => ({
              id: tender.id,
              expiresAt: new Date(tender.submittingoffersdate!),
              title: tender.orderobject!,
            }))}
          />
        </BentoCard>
      </section>
    </main>
  );
}
