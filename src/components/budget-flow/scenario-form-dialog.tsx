
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

const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required').max(50, 'Name must be 50 characters or less'),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

interface ScenarioFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  mode: 'create' | 'rename';
  initialName?: string;
}

export const ScenarioFormDialog: React.FC<ScenarioFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialName,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'rename' && initialName) {
        reset({ name: initialName });
      } else {
        reset({ name: '' });
      }
    }
  }, [isOpen, mode, initialName, reset]);

  const handleFormSubmit = (data: ScenarioFormData) => {
    onSubmit(data.name);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {mode === 'create' ? 'Create New Scenario' : 'Rename Scenario'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? "Enter a name for your new scenario. It will start with a copy of the current scenario's categories."
              : `Enter a new name for the scenario "${initialName || ''}".`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Scenario Name</Label>
            <Input id="name" {...register('name')} className="mt-1 bg-background" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
              {mode === 'create' ? 'Create Scenario' : 'Save Name'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
