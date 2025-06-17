// budget-optimization.ts
'use server';

/**
 * @fileOverview AI-powered budget optimization flow.
 *
 * This file defines a Genkit flow that takes user's income, expenses,
 * and savings goals as input, and suggests potential areas for budget
 * optimization. The suggestions are based on historical data and common
 * spending patterns, presented with estimated impact on savings.
 *
 * @module src/ai/flows/budget-optimization
 *
 * @interface BudgetOptimizationInput - Defines the input schema for the budget optimization flow.
 * @interface BudgetOptimizationOutput - Defines the output schema for the budget optimization flow.
 * @function optimizeBudget - A server action that triggers the budget optimization flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BudgetOptimizationInputSchema = z.object({
  income: z.number().describe('Total monthly income.'),
  expenses: z.record(z.number()).describe('A list of expenses with category names and amounts.'),
  savingsGoal: z.number().describe('Desired monthly savings amount.'),
});

export type BudgetOptimizationInput = z.infer<typeof BudgetOptimizationInputSchema>;

const BudgetOptimizationOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      category: z.string().describe('Expense category to optimize.'),
      potentialSavings: z.number().describe('Estimated monthly savings from optimizing this category.'),
      justification: z.string().describe('Explanation of why this category was chosen for optimization.'),
    })
  ).describe('A list of budget optimization suggestions.'),
});

export type BudgetOptimizationOutput = z.infer<typeof BudgetOptimizationOutputSchema>;


export async function optimizeBudget(input: BudgetOptimizationInput): Promise<BudgetOptimizationOutput> {
  return optimizeBudgetFlow(input);
}

const budgetOptimizationPrompt = ai.definePrompt({
  name: 'budgetOptimizationPrompt',
  input: {schema: BudgetOptimizationInputSchema},
  output: {schema: BudgetOptimizationOutputSchema},
  prompt: `You are a personal finance advisor. Given the user's income, expenses, and savings goals, provide specific and actionable suggestions for budget optimization.

  Income: {{income}}
  Expenses: {{JSON.stringify expenses}}
  Savings Goal: {{savingsGoal}}

  Consider common spending patterns and areas where the user may be overspending.  Focus on suggesting cuts to discretionary spending, or finding better deals on fixed expenses, not cutting essentials. Provide estimated savings for each suggestion. Be encouraging and supportive.

  Format your response as a JSON array of suggestions, where each suggestion includes the expense category, potential savings, and a brief justification.
  `,
});

const optimizeBudgetFlow = ai.defineFlow(
  {
    name: 'optimizeBudgetFlow',
    inputSchema: BudgetOptimizationInputSchema,
    outputSchema: BudgetOptimizationOutputSchema,
  },
  async input => {
    const {output} = await budgetOptimizationPrompt(input);
    return output!;
  }
);
