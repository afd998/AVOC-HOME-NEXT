"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { segment: "onsite", count: 38, fill: "var(--color-onsite)" },
  { segment: "hybrid", count: 28, fill: "var(--color-hybrid)" },
  { segment: "recording", count: 22, fill: "var(--color-recording)" },
  { segment: "qc", count: 14, fill: "var(--color-qc)" },
  { segment: "training", count: 10, fill: "var(--color-training)" },
];

const chartConfig = {
  count: {
    label: "Sessions",
  },
  onsite: {
    label: "Onsite set-ups",
    color: "var(--chart-1)",
  },
  hybrid: {
    label: "Hybrid events",
    color: "var(--chart-2)",
  },
  recording: {
    label: "Recording only",
    color: "var(--chart-3)",
  },
  qc: {
    label: "QC spot-checks",
    color: "var(--chart-4)",
  },
  training: {
    label: "Training blocks",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function DailyReportChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Service mix</CardTitle>
        <CardDescription>Placeholder view for today&apos;s demand</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[240px] w-full max-w-[320px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="count" nameKey="segment" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this week <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Mock data to visualize how workloads split across services.
        </div>
      </CardFooter>
    </Card>
  );
}
