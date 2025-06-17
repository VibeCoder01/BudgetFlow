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
import type { Category, CategoryFormData } from '@/types';
import { DEFAULT_CATEGORY_ICON } from '@/lib/constants';
import * as Icons from 'lucide-react'; // For icon picker if implemented later

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
  currentValue: z.coerce.number().min(0, 'Value must be non-negative'),
  maxValue: z.coerce.number().min(0, 'Max value must be non-negative'),
  icon: z.string().optional(),
}).refine(data => data.currentValue <= data.maxValue, {
  message: "Current value cannot exceed max value",
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
    watch
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ? {
      ...initialData,
      description: initialData.description || '',
      icon: initialData.icon || DEFAULT_CATEGORY_ICON,
    } : {
      name: '',
      description: '',
      currentValue: 0,
      maxValue: 1000,
      icon: DEFAULT_CATEGORY_ICON,
    },
  });

  const watchedMaxValue = watch("maxValue");

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        description: initialData.description || '',
        icon: initialData.icon || DEFAULT_CATEGORY_ICON,
      });
    } else {
      reset({
        name: '',
        description: '',
        currentValue: 0,
        maxValue: 1000,
        icon: DEFAULT_CATEGORY_ICON,
      });
    }
  }, [initialData, reset, isOpen]);
  
  useEffect(() => {
    const currentVal = watch("currentValue");
    if (currentVal > watchedMaxValue) {
      setValue("currentValue", watchedMaxValue);
    }
  }, [watchedMaxValue, setValue, watch]);


  const handleFormSubmit = (data: CategoryFormData) => {
    onSubmit(data, initialData?.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {initialData ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of your category.' : 'Fill in the details for your new financial category.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" {...register('name')} className="mt-1 bg-background" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...register('description')} className="mt-1 bg-background" />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentValue">Initial Value (Monthly)</Label>
              <Input id="currentValue" type="number" step="0.01" {...register('currentValue')} className="mt-1 bg-background" />
              {errors.currentValue && <p className="text-sm text-destructive mt-1">{errors.currentValue.message}</p>}
            </div>
            <div>
              <Label htmlFor="maxValue">Max Value (Monthly)</Label>
              <Input id="maxValue" type="number" step="0.01" {...register('maxValue')} className="mt-1 bg-background" />
              {errors.maxValue && <p className="text-sm text-destructive mt-1">{errors.maxValue.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="icon">Icon Name (e.g., Home, Car, Zap from Lucide)</Label>
            <Input id="icon" {...register('icon')} className="mt-1 bg-background" placeholder={DEFAULT_CATEGORY_ICON} />
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
