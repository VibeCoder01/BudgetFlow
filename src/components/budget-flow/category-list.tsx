
"use client";

import React from 'react';
import type { Category } from '@/types';
import CategoryRow from './category-row';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WEEKS_IN_MONTH_APPROX } from '@/lib/constants';

interface CategoryListProps {
  categories: Category[];
  onUpdateCategory: (updatedCategory: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onUpdateCategory,
  onDeleteCategory,
  onEditCategory,
}) => {
  const totalMonthlyValue = categories.reduce((sum, cat) => sum + cat.currentValue, 0);
  const totalWeeklyValue = totalMonthlyValue / WEEKS_IN_MONTH_APPROX;
  const totalYearlyValue = totalMonthlyValue * 12;

  return (
    <div className="space-y-6">
      {categories.length === 0 ? (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">No Categories Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Click "Add New Category" to get started!</p>
          </CardContent>
        </Card>
      ) : (
        categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onEditCategory={onEditCategory}
          />
        ))
      )}
      {categories.length > 0 && (
        <Card className="mt-6 shadow-lg sticky bottom-4 z-10">
          <CardHeader className="py-3 px-4">
            <CardTitle className="font-headline text-lg text-primary">Budget Summary</CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
              <div className="flex items-baseline">
                <span className="text-xs text-muted-foreground mr-1">Monthly:</span>
                <span className="text-xl font-bold tracking-tight">£{totalMonthlyValue.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xs text-muted-foreground mr-1">Weekly:</span>
                <span className="text-base font-semibold">£{totalWeeklyValue.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xs text-muted-foreground mr-1">Yearly:</span>
                <span className="text-base font-semibold">£{totalYearlyValue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryList;
