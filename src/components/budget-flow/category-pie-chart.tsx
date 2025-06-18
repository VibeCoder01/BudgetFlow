
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
  'hsl(220 70% 50%)', 
  'hsl(160 60% 45%)',
  'hsl(30 80% 55%)',
  'hsl(280 65% 60%)',
  'hsl(340 75% 55%)',
];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ categories }) => {
  const categoriesWithValue = categories.filter(
    (category) => Math.round(category.currentValue) > 0
  );

  const chartData = categoriesWithValue.map((category) => ({
    name: category.name,
    value: Math.round(category.currentValue),
    icon: category.icon, 
  }));

  const chartConfig = {} as ChartConfig;
  chartData.forEach((item, index) => {
    chartConfig[item.name] = {
      label: item.name,
      color: PREDEFINED_CHART_COLORS[index % PREDEFINED_CHART_COLORS.length],
    };
  });

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Spending Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data to display in chart. Add or adjust categories to have values greater than zero.</p>
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
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[800px]">
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
                outerRadius="75%" 
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const currentItem = chartData[index]; // Use chartData which is already filtered
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const displayPercent = (percent * 100).toFixed(0);
                  
                  if (parseFloat(displayPercent) < 5) return null;

                  const categoryName = currentItem.name;
                  const truncatedName = categoryName.length > 7
                                        ? `${categoryName.substring(0, 7)}...`
                                        : categoryName;

                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs font-medium fill-foreground"
                    >
                      {`${truncatedName} (${displayPercent}%)`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={chartConfig[entry.name]?.color || PREDEFINED_CHART_COLORS[index % PREDEFINED_CHART_COLORS.length]}
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={`${entry.name}: £${entry.value}`} 
                  />
                ))}
              </Pie>
              <ChartLegend 
                content={<ChartLegendContent nameKey="name" />} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryPieChart;
