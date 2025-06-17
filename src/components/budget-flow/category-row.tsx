
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
  const [localCurrentValue, setLocalCurrentValue] = useState(category.currentValue);
  const [localMaxValue, setLocalMaxValue] = useState(category.maxValue);

  useEffect(() => {
    setLocalName(category.name);
    setLocalDescription(category.description);
    setLocalCurrentValue(category.currentValue);
    setLocalMaxValue(category.maxValue);
  }, [category]);

  const handleValueChange = useCallback((newMonthlyValue: number) => {
    const clampedValue = Math.max(0, Math.min(newMonthlyValue, localMaxValue));
    setLocalCurrentValue(clampedValue);
    onUpdateCategory({ ...category, currentValue: clampedValue, maxValue: localMaxValue });
  }, [category, localMaxValue, onUpdateCategory]);

  const handleMaxValueChange = (newMaxValueStr: string) => {
    const newMaxValue = parseFloat(newMaxValueStr) || 0;
    const clampedNewMaxValue = Math.max(0, newMaxValue);
    setLocalMaxValue(clampedNewMaxValue);
    const newCurrentValue = Math.min(localCurrentValue, clampedNewMaxValue);
    setLocalCurrentValue(newCurrentValue);
    onUpdateCategory({ ...category, currentValue: newCurrentValue, maxValue: clampedNewMaxValue });
  };

  const weeklyValue = localCurrentValue / WEEKS_IN_MONTH_APPROX;

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DynamicIcon name={category.icon} className="text-primary" size={28} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Current Value Section */}
          <div className="space-y-2">
            <Label htmlFor={`currentValue-${category.id}`} className="text-sm font-medium">Current Value (Monthly): £{localCurrentValue.toFixed(2)}</Label>
            <Input
              id={`currentValue-${category.id}`}
              type="number"
              value={localCurrentValue.toString()} // Controlled input
              onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
              onBlur={(e) => handleValueChange(parseFloat(e.target.value) || 0)} // Ensure update on blur
              min="0"
              max={localMaxValue}
              step="0.01"
              className="bg-background/70 text-base"
              aria-label={`Current monthly value for ${localName}`}
            />
          </div>

          {/* Max Value Section */}
          <div className="space-y-2">
            <Label htmlFor={`maxValue-${category.id}`} className="text-sm font-medium">Max Value (Monthly): £{localMaxValue.toFixed(2)}</Label>
            <Input
              id={`maxValue-${category.id}`}
              type="number"
              value={localMaxValue.toString()} // Controlled input
              onChange={(e) => handleMaxValueChange(e.target.value)}
              min="0"
              step="0.01"
              className="bg-background/70 text-base"
              aria-label={`Maximum monthly value for ${localName}`}
            />
          </div>
        </div>

        {/* Slider Section */}
        <div className="mt-4 space-y-4">
          {/* Monthly Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Monthly Slider</span>
              <span>£{localCurrentValue.toFixed(2)} / £{localMaxValue.toFixed(2)}</span>
            </div>
            <Slider
              value={[localCurrentValue]}
              onValueChange={([val]) => handleValueChange(val)}
              max={localMaxValue}
              step={localMaxValue / 1000 > 0.01 ? Math.max(0.01, localMaxValue / 1000) : 0.01}
              className={cn('[&_[role=slider]]:bg-primary', localMaxValue === 0 ? 'opacity-50 cursor-not-allowed' : '')}
              disabled={localMaxValue === 0}
              aria-label={`Monthly value slider for ${localName}`}
            />
            <p className="text-sm text-muted-foreground pt-1">Approx. Weekly: £{weeklyValue.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryRow;
