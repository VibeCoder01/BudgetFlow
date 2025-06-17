
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

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ categories }) => {
  const filteredCategories = categories.filter((category) => category.currentValue > 0);

  const chartData = useMemo(() => {
    if (filteredCategories.length === 0) return [];
    const dataEntry: { [key: string]: string | number } = { name: 'Spending' };
    filteredCategories.forEach(category => {
      dataEntry[category.name] = category.currentValue;
    });
    return [dataEntry];
  }, [filteredCategories]);


  const chartConfig = useMemo(() => {
    const config = {} as ChartConfig;
    filteredCategories.forEach((category, index) => {
      config[category.name] = {
        label: category.name,
        color: PREDEFINED_CHART_COLORS[index % PREDEFINED_CHART_COLORS.length],
      };
    });
    return config;
  }, [filteredCategories]);

  const totalValue = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.currentValue, 0);
  }, [filteredCategories]);

  if (filteredCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Spending Breakdown (Bar)</CardTitle>
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
        <CardTitle className="font-headline text-xl text-center">Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-[4/1] max-h-[150px] sm:max-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
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
                tickFormatter={(value) => `£${value}`}
              />
              <YAxis type="category" dataKey="name" hide />
              {filteredCategories.map((category) => (
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
                wrapperStyle={{ paddingTop: '20px' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryBarChart;
