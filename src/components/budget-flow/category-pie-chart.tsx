
"use client";

import React from 'react';
import type { Category } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CategoryPieChartProps {
  categories: Category[];
}

const PREDEFINED_CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(220 70% 50%)', // Adding more distinct colors
  'hsl(160 60% 45%)',
  'hsl(30 80% 55%)',
  'hsl(280 65% 60%)',
  'hsl(340 75% 55%)',
];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ categories }) => {
  const chartData = categories
    .filter((category) => category.currentValue > 0)
    .map((category) => ({
      name: category.name,
      value: category.currentValue,
      icon: category.icon, // Store icon for potential use in legend/tooltip
    }));

  const chartConfig = {} as ChartConfig;
  chartData.forEach((item, index) => {
    chartConfig[item.name] = {
      label: item.name,
      color: PREDEFINED_CHART_COLORS[index % PREDEFINED_CHART_COLORS.length],
      // icon: DynamicIcon? // Could use item.icon here if DynamicIcon is importable and usable by ChartLegendContent
    };
  });

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Spending Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data to display in chart. Add categories with values greater than zero.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-center">Spending Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px] sm:max-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const displayPercent = (percent * 100).toFixed(0);
                  
                  // Only display label if percent is significant enough
                  if (parseFloat(displayPercent) < 5) return null;

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs font-medium fill-primary-foreground"
                    >
                      {`${chartData[index].name.substring(0,10)}${chartData[index].name.length > 10 ? '...' : ''} (${displayPercent}%)`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartConfig[entry.name]?.color || PREDEFINED_CHART_COLORS[index % PREDEFINED_CHART_COLORS.length]}
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={`${entry.name}: £${entry.value.toFixed(2)}`}
                  />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryPieChart;
