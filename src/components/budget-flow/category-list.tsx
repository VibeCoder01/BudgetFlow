
"use client";

import React from 'react';
import type { Category } from '@/types';
import CategoryRow from './category-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    </div>
  );
};

export default CategoryList;
