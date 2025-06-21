
"use client";

import React, { useMemo } from 'react';
import type { Category } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
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

interface CategoryBarChartProps {
  categories: Category[];
  title?: string;
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

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ categories, title = "Spending Breakdown" }) => {
  const categoriesToPlot = useMemo(() => {
    return categories.filter((category) => Math.round(category.currentValue) > 0);
  }, [categories]);

  const chartConfig = useMemo(() => {
    const config = {} as ChartConfig;
    // Configure styles for categories that will be plotted
    categoriesToPlot.forEach((category, index) => {
      config[category.name] = {
        label: category.name,
        color: PREDEFINED_CHART_COLORS[index % PREDEFINED_CHART_COLORS.length],
      };
    });
    return config;
  }, [categoriesToPlot]);
  
  const chartDataForBars = useMemo(() => {
    if (categoriesToPlot.length === 0) return [];
    const dataEntry: { [key: string]: string | number } = { name: 'Data' };
    categoriesToPlot.forEach(category => {
      dataEntry[category.name] = Math.round(category.currentValue);
    });
    return [dataEntry];
  }, [categoriesToPlot]);

  const totalValue = useMemo(() => {
    return categoriesToPlot.reduce((sum, cat) => sum + Math.round(cat.currentValue), 0);
  }, [categoriesToPlot]);

  if (categoriesToPlot.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="font-headline text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-muted-foreground text-sm">No data to display in chart. Add categories with values greater than zero.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="font-headline text-lg text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <ChartContainer config={chartConfig} className="w-full mx-auto aspect-[4/1] max-h-[150px] sm:max-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartDataForBars}
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
            >
              <RechartsTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent hideLabel />}
              />
              <XAxis
                type="number"
                domain={[0, totalValue]}
                stroke="hsl(var(--foreground))"
                tickFormatter={(value) => `£${Math.round(value)}`}
              />
              <YAxis type="category" dataKey="name" hide />
              {categoriesToPlot.map((category) => (
                <Bar
                  key={category.id}
                  dataKey={category.name}
                  stackId="a"
                  fill={chartConfig[category.name]?.color || '#8884d8'}
                  radius={[0, 0, 0, 0]} 
                  name={category.name}
                />
              ))}
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                wrapperStyle={{ paddingTop: '12px' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryBarChart;
