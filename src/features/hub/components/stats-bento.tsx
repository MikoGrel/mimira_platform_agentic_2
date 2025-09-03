"use client";

import { BentoCard } from "$/components/ui/bento-card";
import { StateFunnel } from "$/features/stats/components/state-funnel";
import { WeeklyStats } from "$/features/stats/components/weekly-stats";
import { cn } from "$/lib/utils";
import { Tab, Tabs } from "@heroui/react";
import { AlignLeft, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface StatsBentoProps {
  loading?: boolean;
  className?: string;
}

export function StatsBento({ loading, className }: StatsBentoProps) {
  const [tab, setTab] = useState<"Funnel" | "Weekly">("Funnel");
  const [direction, setDirection] = useState(0);

  const tabs = ["Funnel", "Weekly"] as const;

  const handleTabChange = (newTab: "Funnel" | "Weekly") => {
    const currentIndex = tabs.indexOf(tab);
    const newIndex = tabs.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setTab(newTab);
  };

  const tabVariants = {
    initial: (custom: { direction: number; isLeftTab: boolean }) => ({
      x: custom.isLeftTab ? 20 : -20,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (custom: { direction: number }) => ({
      x: custom.direction > 0 ? -20 : 20,
      opacity: 0,
    }),
  };

  return (
    <BentoCard
      loading={loading}
      title={<div>Stats</div>}
      titleExtra={
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) =>
            handleTabChange(key as "Funnel" | "Weekly")
          }
          size="sm"
        >
          <Tab
            key="Funnel"
            name="Funnel"
            title={<AlignLeft className="w-4 h-4" />}
          ></Tab>
          <Tab
            isDisabled
            key="Weekly"
            name="Weekly"
            title={<Calendar className="w-4 h-4" />}
          ></Tab>
        </Tabs>
      }
      className={cn("relative overflow-hidden", className)}
      bodyClassName="overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {tab === "Funnel" && (
          <motion.div
            key="funnel"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={{ direction, isLeftTab: true }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <StateFunnel />
          </motion.div>
        )}
        {tab === "Weekly" && (
          <motion.div
            key="weekly"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={{ direction, isLeftTab: false }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <WeeklyStats />
          </motion.div>
        )}
      </AnimatePresence>
    </BentoCard>
  );
}
