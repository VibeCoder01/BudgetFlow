
"use client";

import React from 'react';
import type { Category } from '@/types';
import CategoryRow from './category-row';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
  const totalValue = categories.reduce((sum, cat) => sum + cat.currentValue, 0);

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
        <Card className="mt-8 shadow-lg sticky bottom-4 z-10">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Total Monthly Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight">£{totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryList;
