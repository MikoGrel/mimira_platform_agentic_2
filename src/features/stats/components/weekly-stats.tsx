"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "$/components/ui/chart";
import { useWeeklyTendersCount } from "$/features/stats/api/use-weekly-tenders-count";
import { CartesianGrid, XAxis, Line, LabelList, LineChart } from "recharts";

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export function WeeklyStats() {
  const { data: weeklyStats } = useWeeklyTendersCount();

  const total = weeklyStats?.weeks.reduce(
    (acc, week) => acc + week.mappings_count,
    0
  );
  const average = Math.ceil(
    total ? total / (weeklyStats?.weeks.length ?? 0) : 0
  );

  return (
    <div className="flex flex-col h-full justify-between gap-4 overflow-x-hidden">
      <p className="text-muted-foreground font-semibold text-sm">
        Last 4 weeks
      </p>
      <ChartContainer config={chartConfig}>
        <LineChart
          data={weeklyStats?.weeks ?? []}
          margin={{
            top: 20,
            left: 25,
            right: 25,
          }}
        >
          <ChartTooltip cursor={false} />
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="week_start"
            tickLine={false}
            axisLine={false}
            interval={0}
            tickMargin={8}
          />
          <Line
            dataKey="mappings_count"
            type="natural"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-primary)",
            }}
            activeDot={{
              r: 6,
            }}
          >
            <LabelList
              position="top"
              offset={12}
              className="fill-foreground"
              fontSize={12}
            />
          </Line>
        </LineChart>
      </ChartContainer>
      <div className="mt-1.5 text-sm text-muted-foreground">
        <p className="flex justify-between">
          <span className="font-medium">Total:</span> {total ?? "..."}
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Weekly average:</span>{" "}
          {average ?? "..."}
        </p>
      </div>
    </div>
  );
}
