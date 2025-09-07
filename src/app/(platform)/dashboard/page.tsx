"use client";

import { useCurrentUser } from "$/features/auth/api";
import { AnimatedSymbol } from "$/features/branding/components";
import {
  NewTendersBento,
  StatsBento,
  LastTenderBento,
  DeadlineCalendarBento,
} from "$/features/hub";
import { useDailySummary } from "$/features/stats/api/use-daily-summary";
import { AnimatePresence, motion } from "motion/react";

export default function DashboardPage() {
  const { data: dailySummary } = useDailySummary();
  const { user, isLoading } = useCurrentUser();

  return (
    <main className="w-full bg-primary-gradient">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 p-4 lg:pt-12">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col-reverse lg:flex-row lg:items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold font-heading flex items-center gap-2 overflow-hidden">
              <AnimatedSymbol
                isLoading={isLoading}
                className="w-8 h-8 text-primary"
              />{" "}
              Hello,{" "}
              <AnimatePresence>
                {user?.profile?.first_name && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      ease: "easeInOut",
                      duration: 0.2,
                    }}
                  >
                    {user.profile.first_name}
                  </motion.span>
                )}
              </AnimatePresence>
            </h1>
          </div>
          <p className="max-w-[75%] text-muted-foreground">
            In last 7 days we&apos;ve managed to find you{" "}
            {dailySummary?.mappings_created_last_week ?? "..."} new tenders,{" "}
            {dailySummary?.expiring_this_week ?? "..."} require filling out the
            application this week.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-rows-[380px_330px] lg:grid-cols-6 gap-6">
          <NewTendersBento className="lg:col-start-1 lg:col-end-5" />
          <StatsBento
            className="lg:col-start-5 lg:col-end-7"
            loading={isLoading}
          />
          <LastTenderBento className="lg:col-start-1 lg:col-end-4" />
          <DeadlineCalendarBento className="lg:col-start-4 lg:col-end-7" />
        </section>
      </div>
    </main>
  );
}
