
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Category, AiOptimizationResult } from '@/types';
import { optimizeBudget, BudgetOptimizationInput } from '@/ai/flows/budget-optimization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Sparkles, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const optimizerSchema = z.object({
  income: z.coerce.number().min(0, 'Income must be non-negative'),
  savingsGoal: z.coerce.number().min(0, 'Savings goal must be non-negative'),
});

type OptimizerFormData = z.infer<typeof optimizerSchema>;

interface BudgetOptimizerProps {
  categories: Category[];
}

const BudgetOptimizer: React.FC<BudgetOptimizerProps> = ({ categories }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiOptimizationResult | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OptimizerFormData>({
    resolver: zodResolver(optimizerSchema),
    defaultValues: {
      income: 0,
      savingsGoal: 0,
    },
  });

  const handleOptimize = async (data: OptimizerFormData) => {
    setIsLoading(true);
    setAiResult(null);

    const expenses = categories.reduce((acc, category) => {
      acc[category.name] = category.currentValue;
      return acc;
    }, {} as Record<string, number>);

    const input: BudgetOptimizationInput = {
      income: data.income,
      expenses,
      savingsGoal: data.savingsGoal,
    };

    try {
      const result = await optimizeBudget(input);
      setAiResult(result);
      if(result.suggestions.length === 0) {
        toast({
          title: "Optimization Complete",
          description: "No specific optimization suggestions found based on your current budget.",
        });
      }
    } catch (error) {
      console.error('Error optimizing budget:', error);
      toast({
        variant: "destructive",
        title: "Optimization Error",
        description: "Could not get optimization suggestions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <CardTitle className="font-headline text-2xl">AI Budget Optimizer</CardTitle>
        </div>
        <CardDescription>
          Let AI help you find potential savings. Enter your monthly income and savings goal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleOptimize)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="income">Total Monthly Income (£)</Label>
              <Input id="income" type="number" step="0.01" {...register('income')} className="mt-1 bg-background" />
              {errors.income && <p className="text-sm text-destructive mt-1">{errors.income.message}</p>}
            </div>
            <div>
              <Label htmlFor="savingsGoal">Desired Monthly Savings Goal (£)</Label>
              <Input id="savingsGoal" type="number" step="0.01" {...register('savingsGoal')} className="mt-1 bg-background" />
              {errors.savingsGoal && <p className="text-sm text-destructive mt-1">{errors.savingsGoal.message}</p>}
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Get Suggestions
              </>
            )}
          </Button>
        </form>

        {aiResult && aiResult.suggestions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><TrendingDown className="text-accent"/>Optimization Suggestions:</h3>
            <Accordion type="single" collapsible className="w-full">
              {aiResult.suggestions.map((suggestion, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-b border-border">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex justify-between w-full pr-2">
                      <span>{suggestion.category}</span>
                      <span className="text-primary font-medium">Save ~£{suggestion.potentialSavings.toFixed(2)}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground px-2">
                    {suggestion.justification}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
        {aiResult && aiResult.suggestions.length === 0 && !isLoading && (
          <p className="mt-8 text-muted-foreground">No specific optimization suggestions found with the current data. Your budget might already be quite optimized, or try adjusting your goals!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetOptimizer;
