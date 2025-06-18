
import type { LucideIcon } from 'lucide-react';

export type CategoryType = 'income' | 'expenditure';

export interface Category {
  id: string;
  name: string;
  description: string;
  currentValue: number; // Represents monthly value
  maxValue: number;
  icon: string; // Name of the lucide-react icon
  isActive: boolean;
  isPredefined: boolean;
  type: CategoryType;
}

// Helper type for category form data
export type CategoryFormData = Omit<Category, 'id' | 'icon' | 'isActive' | 'isPredefined'> & { icon?: string };

export interface Scenario {
  id: string;
  name: string;
  categories: Category[];
}
