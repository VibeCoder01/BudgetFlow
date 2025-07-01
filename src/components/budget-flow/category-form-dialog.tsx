
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Category, CategoryFormData, CategoryType } from '@/types';
import { DEFAULT_CATEGORY_ICON } from '@/lib/constants';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as Icons from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
  currentValue: z.coerce.number().min(0, 'Value must be non-negative').step(1),
  maxValue: z.coerce.number().min(0, 'Max value must be non-negative').step(1),
  icon: z.string().optional(),
  type: z.enum(['income', 'expenditure']).default('expenditure'),
}).refine(data => Math.round(data.currentValue) <= Math.round(data.maxValue), {
  message: "Current value cannot exceed max value.",
  path: ["currentValue"],
});

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData, id?: string) => void;
  initialData?: Category;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
    control
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      currentValue: 0,
      maxValue: 1000,
      icon: DEFAULT_CATEGORY_ICON,
      type: 'expenditure',
    },
  });

  const watchedMaxValue = watch("maxValue");
  const watchedCategoryType = watch("type"); // Keep watching type for UI label changes if needed

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || '',
          currentValue: Math.round(initialData.currentValue),
          maxValue: Math.round(initialData.maxValue),
          icon: initialData.icon || DEFAULT_CATEGORY_ICON,
          type: initialData.type || 'expenditure',
        });
      } else {
        reset({
          name: '',
          description: '',
          currentValue: 0,
          maxValue: 1000,
          icon: DEFAULT_CATEGORY_ICON,
          type: 'expenditure',
        });
      }
    }
  }, [initialData, reset, isOpen]);

  useEffect(() => {
    const currentVal = watch("currentValue");
    if (Math.round(currentVal) > Math.round(watchedMaxValue)) {
      setValue("currentValue", Math.round(watchedMaxValue));
    }
  }, [watchedMaxValue, setValue, watch]);

  const handleFormSubmit = (data: CategoryFormData) => {
    const submitData = {
      ...data,
      currentValue: Math.round(data.currentValue),
      maxValue: Math.round(data.maxValue),
    };
    // No longer forcing maxValue to equal currentValue for income
    onSubmit(submitData, initialData?.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">
            {initialData ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of your category.' : 'Fill in the details for your new financial category.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="type" className="text-base">Category Type</Label>
            <RadioGroup
              defaultValue={initialData?.type || "expenditure"}
              onValueChange={(value: CategoryType) => setValue("type", value)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expenditure" id="type-expenditure" />
                <Label htmlFor="type-expenditure" className="text-base">Expenditure</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="type-income" />
                <Label htmlFor="type-income" className="text-base">Income</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="name" className="text-base">Category Name</Label>
            <Input id="name" {...register('name')} className="mt-1 bg-background text-base" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="description" className="text-base">Description (Optional)</Label>
            <Textarea id="description" {...register('description')} className="mt-1 bg-background text-base" />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentValue" className="text-base">
                {watchedCategoryType === 'income' ? 'Current Income (Monthly)' : 'Current Value (Monthly)'}
              </Label>
              <Input id="currentValue" type="number" step="1" {...register('currentValue')} className="mt-1 bg-background text-base" />
              {errors.currentValue && <p className="text-sm text-destructive mt-1">{errors.currentValue.message}</p>}
            </div>
            <div>
              <Label htmlFor="maxValue" className="text-base">
                Max Slider Value
              </Label>
              <Input id="maxValue" type="number" step="1" {...register('maxValue')} className="mt-1 bg-background text-base" />
              {errors.maxValue && <p className="text-sm text-destructive mt-1">{errors.maxValue.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="icon" className="text-base">Icon Name (e.g., Home, Car, Briefcase from Lucide)</Label>
            <Input id="icon" {...register('icon')} className="mt-1 bg-background text-base" placeholder={DEFAULT_CATEGORY_ICON} />
            {errors.icon && <p className="text-sm text-destructive mt-1">{errors.icon.message}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Find icon names on <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">lucide.dev/icons</a>.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="default">
              {initialData ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
