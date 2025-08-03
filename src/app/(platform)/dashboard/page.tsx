"use client";

import { Button } from "@heroui/react";
import { MoveRight } from "lucide-react";
import MiniTenderCalendar from "$/features/tenders/components/mini-tender-calendar";
import { TenderMiniCard } from "$/features/tenders/components/tender-mini-card";
import { BentoCard } from "$/components/ui/bento-card";
import { VerticalStepper } from "$/components/ui/vertical-stepper";
import Link from "next/link";
import { StateFunnel } from "$/features/stats/components/state-funnel";
import { useTenderInboxQuery } from "$/features/inbox";
import useCurrentUser from "$/features/auth/hooks/use-current-user";
import Symbol from "$/features/branding/components/Symbol";

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { tenders, loading } = useTenderInboxQuery({ pageSize: 3 });

  const tenderSteps = [
    {
      id: "preview",
      title: <>Preview</>,
      completed: true,
    },
    {
      id: "filling-out",
      title: <>Filling-out data</>,
      completed: true,
    },
    {
      id: "application",
      title: <>Application</>,
      completed: false,
      current: true,
    },
  ];

  return (
    <main className="max-w-4xl mx-auto flex flex-col gap-6 p-4 lg:pt-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col-reverse lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold font-heading flex items-center gap-2">
            <Symbol className="w-8 h-8 text-primary" /> Hello,{" "}
            {user?.profile?.first_name}!
          </h1>
        </div>
        <p className="max-w-[75%] text-muted-foreground">
          Today&apos;s briefing: Since yesterday we&apos;ve managed to find you
          5 new tenders, 3 require your attention.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-rows-[380px_320px] lg:grid-cols-6 gap-6">
        <BentoCard
          loading={loading}
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
            {tenders?.map((tender) => (
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
          loading={loading}
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
          loading={loading}
          title={<span>Return to last tender</span>}
          className="lg:col-start-1 lg:col-end-4"
          bodyClassName="flex flex-col gap-4"
        >
          <p className="text-lg font-medium">Restocking medical equipment</p>
          <VerticalStepper steps={tenderSteps} />
          <Button color="primary" endContent={<MoveRight />}>
            Continue
          </Button>
        </BentoCard>
        <BentoCard
          loading={loading}
          title={<span>Deadline calendar</span>}
          className="lg:col-start-4 lg:col-end-7"
          bodyClassName="lg:p-0"
        >
          <MiniTenderCalendar
            expiringTenders={tenders?.map((tender) => ({
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
