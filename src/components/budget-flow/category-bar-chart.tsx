
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
  title: string;
  mainCategories: Category[];
  otherCategories: Category[];
  mainTotal: number;
  otherTotal: number;
  chartMax: number;
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

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ 
  title,
  mainCategories,
  otherCategories,
  mainTotal,
  otherTotal,
  chartMax
}) => {

  const { categoriesToPlot, isWaterfall, specialCategory } = useMemo(() => {
    const isIncomeChart = title.includes("Income");
    const hasSurplus = isIncomeChart && mainTotal > otherTotal;
    const hasDeficit = !isIncomeChart && mainTotal > otherTotal;

    if (hasSurplus) {
      return {
        isWaterfall: true,
        categoriesToPlot: otherCategories.filter(c => Math.round(c.currentValue) > 0),
        specialCategory: { name: 'Surplus', value: mainTotal - otherTotal }
      }
    }
    if (hasDeficit) {
      return {
        isWaterfall: true,
        categoriesToPlot: otherCategories.filter(c => Math.round(c.currentValue) > 0),
        specialCategory: { name: 'Deficit', value: mainTotal - otherTotal }
      }
    }
    
    return {
      isWaterfall: false,
      categoriesToPlot: mainCategories.filter(c => Math.round(c.currentValue) > 0),
      specialCategory: null
    }
  }, [title, mainCategories, otherCategories, mainTotal, otherTotal]);


  const chartConfig = useMemo(() => {
    const config = {} as ChartConfig;
    categoriesToPlot.forEach((category, index) => {
      config[category.name] = {
        label: category.name,
        color: PREDEFINED_CHART_COLORS[index % PREDEFINED_CHART_COLORS.length],
      };
    });
    if (specialCategory) {
      if (specialCategory.name === 'Surplus') {
        config['Surplus'] = { label: 'Surplus', color: 'hsl(48, 96%, 58%)' };
      } else if (specialCategory.name === 'Deficit') {
        config['Deficit'] = { label: 'Deficit', color: 'hsl(0, 84.2%, 60.2%)' };
      }
    }
    return config;
  }, [categoriesToPlot, specialCategory]);
  
  const chartDataForBars = useMemo(() => {
    if (categoriesToPlot.length === 0 && !specialCategory) return [];
    
    const dataEntry: { [key: string]: string | number } = { name: 'Data' };
    
    categoriesToPlot.forEach(category => {
      dataEntry[category.name] = Math.round(category.currentValue);
    });
    
    if (specialCategory) {
        dataEntry[specialCategory.name] = Math.round(specialCategory.value);
    }
    
    return [dataEntry];
  }, [categoriesToPlot, specialCategory]);

  const totalValue = useMemo(() => {
    return chartMax > 0 ? chartMax : 1;
  }, [chartMax]);

  if (chartDataForBars.length === 0) {
    return (
      <Card>
        <CardHeader className="p-2 pb-0">
          <CardTitle className="font-headline text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-muted-foreground text-sm">No data to display in chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="p-2 pb-0">
        <CardTitle className="font-headline text-lg text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
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
              {specialCategory && (
                <Bar
                    key={specialCategory.name}
                    dataKey={specialCategory.name}
                    stackId="a"
                    stroke={chartConfig[specialCategory.name]?.color}
                    fill={chartConfig[specialCategory.name]?.color}
                    fillOpacity={0.3}
                    strokeWidth={1.5}
                    name={specialCategory.name}
                 />
              )}
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryBarChart;
