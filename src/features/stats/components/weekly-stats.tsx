"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "$/components/ui/chart";
import { CartesianGrid, XAxis, Line, LabelList, LineChart } from "recharts";

export const description = "A line chart with a label";
const chartData = [
  { week: "01/06", value: 30 },
  { week: "08/06", value: 50 },
  { week: "15/06", value: 80 },
  { week: "22/06", value: 70 },
];
const chartConfig = {
  value: {
    label: "Value",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export function WeeklyStats() {
  return (
    <div className="flex flex-col h-full justify-between gap-4 overflow-x-hidden">
      <p className="text-muted-foreground font-semibold text-sm">
        Last 4 weeks
      </p>
      <ChartContainer config={chartConfig}>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            left: 25,
            right: 25,
          }}
        >
          <ChartTooltip cursor={false} />
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            interval={0}
            tickMargin={8}
          />
          <Line
            dataKey="value"
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
          <span className="font-medium">Total:</span> 50
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Weekly average:</span> 10
        </p>
      </div>
    </div>
  );
}
