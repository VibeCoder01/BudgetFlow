
"use client";

import React from 'react';
import type { Category } from '@/types';
import CategoryRow from './category-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

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
  const categoryIds = React.useMemo(() => categories.map((c) => c.id), [categories]);

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
        <SortableContext items={categoryIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
        </SortableContext>
      )}
    </div>
  );
};

export default CategoryList;
