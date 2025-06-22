
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
  mainTotal,
  otherTotal,
  chartMax
}) => {

  const { categoriesToPlot, specialCategory } = useMemo(() => {
    const isIncomeChart = title.includes("Income");
    
    const plotCategories = mainCategories.filter(c => Math.round(c.currentValue) > 0);
    let special = null;

    if (isIncomeChart) {
      // Income Chart Context: mainTotal is income, otherTotal is expenditure.
      const income = mainTotal;
      const expenditure = otherTotal;
      if (income < expenditure) {
        special = { name: 'Deficit', value: expenditure - income };
      }
    } else {
      // Expenditure Chart Context: mainTotal is expenditure, otherTotal is income.
      const expenditure = mainTotal;
      const income = otherTotal;
      if (income > expenditure) {
        special = { name: 'Surplus', value: income - expenditure };
      }
    }
    
    return {
      categoriesToPlot: plotCategories,
      specialCategory: special
    }
  }, [title, mainCategories, mainTotal, otherTotal]);


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

  const CustomBarIconLabel = (props: any) => {
    const { x, y, width, height } = props;
    
    if (!specialCategory || width < 30) {
      return null;
    }
    
    const icon = specialCategory.name === 'Surplus' ? '👍' : '👎';
    const iconSize = Math.min(height * 0.8, width * 0.8, 40);
    const iconX = x + width / 2;
    const iconY = y + height / 2;
    
    return (
      <text
        x={iconX}
        y={iconY}
        fill="hsl(var(--foreground))"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={iconSize}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
        opacity={0.35}
      >
        {icon}
      </text>
    );
  };


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
      <CardContent className="p-2 pt-0">
        <ChartContainer config={chartConfig} className="w-full mx-auto aspect-[4/1] max-h-[150px] sm:max-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartDataForBars}
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <pattern id="hatch-surplus" patternUnits="userSpaceOnUse" width="8" height="8">
                  <rect width="8" height="8" fill="transparent" />
                  <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="hsl(48, 96%, 58%)" strokeWidth="1" />
                </pattern>
                <pattern id="hatch-deficit" patternUnits="userSpaceOnUse" width="8" height="8">
                  <rect width="8" height="8" fill="transparent" />
                  <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="hsl(0, 84.2%, 60.2%)" strokeWidth="1" />
                </pattern>
              </defs>
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
                    fill={specialCategory.name === 'Surplus' ? 'url(#hatch-surplus)' : 'url(#hatch-deficit)'}
                    strokeWidth={1.5}
                    name={specialCategory.name}
                    label={<CustomBarIconLabel />}
                 />
              )}
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                wrapperStyle={{ marginTop: 0, paddingTop: 0 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryBarChart;
