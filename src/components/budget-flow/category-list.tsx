
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
    <div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
              onEditCategory={onEditCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
