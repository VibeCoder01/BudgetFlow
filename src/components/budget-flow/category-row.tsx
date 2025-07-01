
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Edit3, GripVertical } from 'lucide-react';
import DynamicIcon from '@/components/icons/dynamic-icon';
import { cn } from '@/lib/utils';
import { WEEKS_IN_MONTH_APPROX } from '@/lib/constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CategoryRowProps {
  category: Category;
  onUpdateCategory: (updatedCategory: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onUpdateCategory,
  onDeleteCategory,
  onEditCategory,
}) => {
  const [localName, setLocalName] = useState(category.name);
  const [localDescription, setLocalDescription] = useState(category.description);
  const [localCurrentValue, setLocalCurrentValue] = useState(Math.round(category.currentValue));
  const [localMaxValue, setLocalMaxValue] = useState(Math.round(category.maxValue));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const isIncome = category.type === 'income';

  useEffect(() => {
    setLocalName(category.name);
    setLocalDescription(category.description);
    setLocalCurrentValue(Math.round(category.currentValue));
    setLocalMaxValue(Math.round(category.maxValue));
  }, [category]);

  const handleValueChange = useCallback((newMonthlyValue: number) => {
    const roundedNewMonthlyValue = Math.round(newMonthlyValue);
    const clampedValue = Math.max(0, Math.min(roundedNewMonthlyValue, localMaxValue));
    
    setLocalCurrentValue(clampedValue);
    onUpdateCategory({ ...category, currentValue: clampedValue, maxValue: localMaxValue });
  }, [category, localMaxValue, onUpdateCategory]);

  const handleMaxValueChange = (newMaxValueStr: string) => {
    const newMaxValue = parseFloat(newMaxValueStr) || 0;
    const roundedNewMaxValue = Math.round(Math.max(0, newMaxValue));
    setLocalMaxValue(roundedNewMaxValue);
    
    const newCurrentValue = Math.round(Math.min(localCurrentValue, roundedNewMaxValue));
    setLocalCurrentValue(newCurrentValue);
    onUpdateCategory({ ...category, currentValue: newCurrentValue, maxValue: roundedNewMaxValue });
  };
  
  const weeklyValue = localCurrentValue / WEEKS_IN_MONTH_APPROX;

  const cardClasses = cn(
    "mb-4 shadow-md hover:shadow-lg transition-shadow duration-300",
    isIncome ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : "bg-card",
    isDragging ? "shadow-2xl ring-2 ring-primary" : ""
  );
  
  const iconColorClass = isIncome ? "text-green-700 dark:text-green-400" : "text-primary";

  return (
    <Card ref={setNodeRef} style={style} className={cardClasses}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 h-auto flex-grow overflow-hidden mr-2">
             <div {...attributes} {...listeners} className="cursor-grab touch-none p-1 self-center -ml-2">
              <GripVertical className="h-10 w-10 sm:h-8 sm:w-8 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
            </div>
            <DynamicIcon name={category.icon} className={cn(iconColorClass, "mt-1 flex-shrink-0 h-12 w-12 sm:h-9 sm:w-9")} />
            <div className="h-full overflow-hidden flex-grow pt-0.5">
              <CardTitle className="font-headline text-4xl sm:text-2xl tracking-tight">
                {localName}
              </CardTitle>
              <CardDescription className="pt-1 text-xl sm:text-base">
                <p className="truncate">{localDescription || ' '}</p>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEditCategory(category)} aria-label={`Edit ${localName}`} className="h-12 w-12 [&_svg]:size-8">
              <Edit3 />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDeleteCategory(category.id)} aria-label={`Delete ${localName}`} className="text-destructive hover:text-destructive/80 h-12 w-12 [&_svg]:size-8">
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor={`currentValue-${category.id}`} className="text-xl sm:text-base font-medium">
              Actual
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-3 text-muted-foreground text-2xl sm:text-lg">£</span>
              <Input
                id={`currentValue-${category.id}`}
                type="number"
                value={localCurrentValue.toString()}
                onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
                onBlur={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
                min="0"
                max={localMaxValue}
                step="1"
                className="bg-background/70 text-2xl h-14 pl-10"
                aria-label={`Actual value for ${localName}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`maxValue-${category.id}`} className="text-xl sm:text-base font-medium">
              Max Slider Value
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-3 text-muted-foreground text-2xl sm:text-lg">£</span>
              <Input
                id={`maxValue-${category.id}`}
                type="number"
                value={localMaxValue.toString()}
                onChange={(e) => handleMaxValueChange(e.target.value)}
                min="0"
                step="1"
                className="bg-background/70 text-2xl h-14 pl-10"
                aria-label={`Max slider value for ${localName}`}
              />
            </div>
          </div>
        </div>

        {/* Slider Section */}
        <div className="mt-4 space-y-2">
          <div className="space-y-1">
            <Slider
              value={[localCurrentValue]}
              onValueChange={([val]) => handleValueChange(val)}
              max={localMaxValue}
              step={1}
              className={cn(
                "h-3",
                isIncome ? '[&_[role=slider]]:bg-green-600' : '[&_[role=slider]]:bg-primary',
                localMaxValue === 0 ? 'opacity-50 cursor-not-allowed' : ''
              )}
              disabled={localMaxValue === 0}
              aria-label={`Monthly value slider for ${localName}`}
            />
            <p className="text-xl sm:text-base text-muted-foreground pt-1">Approx. Weekly: £{Math.round(weeklyValue).toString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryRow;
