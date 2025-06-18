
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Edit3 } from 'lucide-react';
import DynamicIcon from '@/components/icons/dynamic-icon';
import { cn } from '@/lib/utils';
import { WEEKS_IN_MONTH_APPROX } from '@/lib/constants';

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
  const [localMaxValue, setLocalMaxValue] = useState(Math.round(category.maxValue)); // Now independent

  const isIncome = category.type === 'income';

  useEffect(() => {
    setLocalName(category.name);
    setLocalDescription(category.description);
    setLocalCurrentValue(Math.round(category.currentValue));
    setLocalMaxValue(Math.round(category.maxValue));
  }, [category]);

  const handleValueChange = useCallback((newMonthlyValue: number) => {
    const roundedNewMonthlyValue = Math.round(newMonthlyValue);
    // Clamp value between 0 and localMaxValue for both income and expenditure
    const clampedValue = Math.max(0, Math.min(roundedNewMonthlyValue, localMaxValue));
    
    setLocalCurrentValue(clampedValue);
    onUpdateCategory({ ...category, currentValue: clampedValue, maxValue: localMaxValue });
  }, [category, localMaxValue, onUpdateCategory]);


  const handleMaxValueChange = (newMaxValueStr: string) => {
    const newMaxValue = parseFloat(newMaxValueStr) || 0;
    const roundedNewMaxValue = Math.round(Math.max(0, newMaxValue)); // Ensure non-negative
    setLocalMaxValue(roundedNewMaxValue);
    
    // If current value exceeds new max value, adjust current value
    const newCurrentValue = Math.round(Math.min(localCurrentValue, roundedNewMaxValue));
    setLocalCurrentValue(newCurrentValue);
    onUpdateCategory({ ...category, currentValue: newCurrentValue, maxValue: roundedNewMaxValue });
  };
  
  const weeklyValue = localCurrentValue / WEEKS_IN_MONTH_APPROX;

  const cardClasses = cn(
    "mb-4 shadow-md hover:shadow-lg transition-shadow duration-300",
    isIncome ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : "bg-card"
  );
  
  const iconColorClass = isIncome ? "text-green-700 dark:text-green-400" : "text-primary";


  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DynamicIcon name={category.icon} className={iconColorClass} size={28} />
            <CardTitle className="font-headline text-xl tracking-tight">{localName}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEditCategory(category)} aria-label={`Edit ${localName}`}>
              <Edit3 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDeleteCategory(category.id)} aria-label={`Delete ${localName}`} className="text-destructive hover:text-destructive/80">
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {localDescription && (
           <CardDescription className="pt-1 text-sm">{localDescription}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <div className={cn("grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2")}>
          {/* Current Value Section */}
          <div className="space-y-2">
            <Label htmlFor={`currentValue-${category.id}`} className="text-sm font-medium">
              {isIncome ? "Current Income (Monthly)" : "Current Value (Monthly)"}: £{localCurrentValue.toString()}
            </Label>
            <Input
              id={`currentValue-${category.id}`}
              type="number"
              value={localCurrentValue.toString()} // Controlled component
              onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
              onBlur={(e) => handleValueChange(parseFloat(e.target.value) || 0)} // Ensures update on blur if not typed
              min="0"
              max={localMaxValue} // current value cannot exceed max value
              step="1"
              className="mt-1 bg-background/70 text-base"
              aria-label={`${isIncome ? "Current income amount" : "Current monthly value"} for ${localName}`}
            />
          </div>

          {/* Max Value Section - Now always visible */}
          <div className="space-y-2">
            <Label htmlFor={`maxValue-${category.id}`} className="text-sm font-medium">
              {isIncome ? "Target Income (Monthly)" : "Max Value (Monthly)"}: £{localMaxValue.toString()}
            </Label>
            <Input
              id={`maxValue-${category.id}`}
              type="number"
              value={localMaxValue.toString()} // Controlled component
              onChange={(e) => handleMaxValueChange(e.target.value)}
              min="0" // Max value can't be negative
              step="1"
              className="mt-1 bg-background/70 text-base"
              aria-label={`${isIncome ? "Target monthly income" : "Maximum monthly value"} for ${localName}`}
            />
          </div>
        </div>

        {/* Slider Section */}
        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Monthly Slider</span>
              <span>£{Math.round(localCurrentValue).toString()} / £{Math.round(localMaxValue).toString()}</span>
            </div>
            <Slider
              value={[localCurrentValue]}
              onValueChange={([val]) => handleValueChange(val)}
              max={localMaxValue} // Slider max is localMaxValue
              step={1}
              className={cn(
                isIncome ? '[&_[role=slider]]:bg-green-600' : '[&_[role=slider]]:bg-primary',
                localMaxValue === 0 ? 'opacity-50 cursor-not-allowed' : '' // Disable slider if max is 0
              )}
              disabled={localMaxValue === 0} // Disable slider interaction if max is 0
              aria-label={`Monthly value slider for ${localName}`}
            />
            <p className="text-sm text-muted-foreground pt-1">Approx. Weekly: £{Math.round(weeklyValue).toString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryRow;

