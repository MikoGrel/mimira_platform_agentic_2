"use client";

import { Accordion, AccordionItem, Chip } from "@heroui/react";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "$/components/ui/chart";

interface Criteria {
  opis: string;
  kryterium: string;
  waga: `${string}%`;
}

const chartColors = [
  "#1e40af", // deep blue
  "#059669", // forest green
  "#7c3aed", // deep purple
  "#dc2626", // deep red
  "#ea580c", // deep orange
  "#0891b2", // deep cyan
  "#4b5563", // slate gray
  "#374151", // dark gray
];

export function ReviewCriteria({
  reviewCriteria,
}: {
  reviewCriteria: Criteria[];
}) {
  // Transform criteria data for pie chart
  const chartData = reviewCriteria.map((criteria, index) => ({
    name: criteria.kryterium,
    value: parseFloat(criteria.waga.replace("%", "")),
    fill: chartColors[index % chartColors.length],
  }));

  // Create chart config
  const chartConfig: ChartConfig = reviewCriteria.reduce(
    (config, criteria, index) => {
      const key = criteria.kryterium.replace(/\s+/g, "_").toLowerCase();
      config[key] = {
        label: criteria.kryterium,
        color: chartColors[index % chartColors.length],
      };
      return config;
    },
    {} as ChartConfig
  );

  if (reviewCriteria.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No review criteria available</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row items-start gap-4 overflow-hidden">
      <div className="flex-shrink-0 w-40 h-40">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={60}
              paddingAngle={6}
              cornerRadius={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs uppercase text-muted-foreground">
                            {data.name}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {data.value}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ChartContainer>
      </div>

      <Accordion defaultExpandedKeys={["0"]}>
        {reviewCriteria.map((criteria, index) => (
          <AccordionItem
            disabled={!criteria.opis}
            key={index}
            classNames={{
              trigger: "pb-2",
              content: "pt-0",
            }}
            title={
              <div className="flex items-center gap-3 text-sm">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: chartColors[index % chartColors.length],
                  }}
                />
                <Chip color="primary" variant="flat" size="sm">
                  {criteria.waga}
                </Chip>
                <span className="flex-1">{criteria.kryterium}</span>
              </div>
            }
          >
            {criteria.opis && (
              <p className="text-sm text-muted-foreground">{criteria.opis}</p>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
