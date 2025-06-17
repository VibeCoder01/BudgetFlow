import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  description: string;
  currentValue: number; // Represents monthly value
  maxValue: number;
  icon: string; // Name of the lucide-react icon
}

export interface AiOptimizationResult {
  suggestions: Array<{
    category: string;
    potentialSavings: number;
    justification: string;
  }>;
}

// Helper type for category form data
export type CategoryFormData = Omit<Category, 'id' | 'icon'> & { icon?: string };
