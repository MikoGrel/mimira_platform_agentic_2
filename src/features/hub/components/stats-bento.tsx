"use client";

import { BentoCard } from "$/components/ui/bento-card";
import { StateFunnel } from "$/features/stats/components/state-funnel";
import { WeeklyStats } from "$/features/stats/components/weekly-stats";
import { cn } from "$/lib/utils";
import { Tab, Tabs } from "@heroui/react";
import { AlignLeft, Calendar } from "lucide-react";
import { useState } from "react";

interface StatsBentoProps {
  loading?: boolean;
  className?: string;
}

export function StatsBento({ loading, className }: StatsBentoProps) {
  const [tab, setTab] = useState<"Funnel" | "Weekly">("Funnel");

  return (
    <BentoCard
      loading={loading}
      title={<div>Stats</div>}
      titleExtra={
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key as "Funnel" | "Weekly")}
          size="sm"
        >
          <Tab
            key="Funnel"
            name="Funnel"
            title={<AlignLeft className="w-4 h-4" />}
          ></Tab>
          <Tab
            key="Weekly"
            name="Weekly"
            title={<Calendar className="w-4 h-4" />}
          ></Tab>
        </Tabs>
      }
      className={cn("relative overflow-hidden", className)}
    >
      {tab === "Funnel" && <StateFunnel />}
      {tab === "Weekly" && <WeeklyStats />}
    </BentoCard>
  );
}
