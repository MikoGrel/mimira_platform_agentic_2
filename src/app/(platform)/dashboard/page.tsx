"use client";

import { Button, Checkbox } from "@heroui/react";
import Symbol from "$/features/branding/components/Symbol";
import { addDays } from "date-fns";
import { MoveRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import MiniTenderCalendar from "$/features/tenders/components/mini-tender-calendar";
import { TenderMiniCard } from "$/features/tenders/components/tender-mini-card";
import { BentoCard } from "$/features/shared/ui/bento-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto h-full flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col-reverse lg:flex-row lg:items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold font-heading">
              Welcome back
            </h1>

            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <span>Generated using:</span>{" "}
              <span className="flex items-center gap-1">
                <Symbol className="w-6 h-6" />
                AI
              </span>
            </p>
          </div>
          <p className="max-w-[80%]">
            Today&apos;s briefing: Since yesterday we&apos;ve managed to find
            you 5 new tenders, 3 require your attention.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-rows-[300px_320px] lg:grid-cols-6 gap-6">
          <BentoCard
            title={<span>New tenders</span>}
            titleExtra={
              <Button variant="light" size="sm">
                Open full list
              </Button>
            }
            className="lg:col-start-1 lg:col-end-5 pb-0"
            bodyClassName="lg:pb-0"
          >
            <div className="h-full overflow-y-auto space-y-4 scrollbar-hide pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TenderMiniCard
                id="123"
                title="Purchase of paraffin candles"
                amount={100_000}
                expirationDate={addDays(new Date(), 2)}
              />
              <TenderMiniCard
                id="456"
                title="Procurement of wax lights"
                amount={100_000}
                expirationDate={addDays(new Date(), 2)}
              />
              <TenderMiniCard
                id="789"
                title="Acquisition of candle supplies"
                amount={100_000}
                expirationDate={addDays(new Date(), 2)}
              />
            </div>
          </BentoCard>
          <BentoCard
            title={<div className="px-4">Stats</div>}
            className="lg:col-start-5 lg:col-end-7 relative overflow-hidden px-0"
            bodyClassName="lg:p-0"
          >
            <div className="px-7 text-sm">
              <p>
                New tenders: <span className="font-semibold">3</span>
              </p>
              <p>
                Overall: <span className="font-semibold">50</span>
              </p>
              <p>
                Accepted: <span className="font-semibold">10</span>
              </p>
            </div>
            <div className="lg:absolute inset-0 top-20 h-20 ">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { value: 1 },
                    { value: 1.2 },
                    { value: 1.4 },
                    { value: 1.7 },
                    { value: 1.2 },
                    { value: 1 },
                  ]}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="blueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="oklch(54.6% 0.245 262.881)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(54.6% 0.245 262.881)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="basis"
                    dataKey="value"
                    stroke="oklch(54.6% 0.245 262.881)"
                    strokeWidth={2}
                    fill="url(#blueGradient)"
                    dot={false}
                    activeDot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>
          <BentoCard
            title={<span>Return to last tender</span>}
            className="lg:col-start-1 lg:col-end-4"
            bodyClassName="flex flex-col gap-4"
          >
            <p className="text-xl font-medium uppercase">
              Restocking medical equipment
            </p>
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
            title={<span>Deadline calendar</span>}
            className="lg:col-start-4 lg:col-end-7"
            bodyClassName="lg:p-0"
          >
            <MiniTenderCalendar
              expiringTenders={[
                {
                  id: "123",
                  expiresAt: addDays(new Date(), 2),
                  title: "Purchase of paraffin candles",
                },
                {
                  id: "456",
                  expiresAt: addDays(new Date(), 5),
                  title: "Procurement of wax lights",
                },
              ]}
            />
          </BentoCard>
        </section>
      </div>
    </div>
  );
}
