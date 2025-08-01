"use client";

import { Accordion, AccordionItem, Chip } from "@heroui/react";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "$/features/shared/ui/chart";

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

export function ReviewCriteria({ reviewCriteria }: { reviewCriteria: Criteria[] }) {
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
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">No review criteria available</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row items-start gap-8 overflow-hidden">
      <div className="flex-shrink-0 w-40 h-44">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={75}
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
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
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

      <Accordion>
        {reviewCriteria.map((criteria, index) => (
          <AccordionItem
            disabled={!criteria.opis}
            key={criteria.kryterium}
            title={
              <div className="flex items-center gap-3">
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
              <p className="text-sm text-gray-600">{criteria.opis}</p>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
} 