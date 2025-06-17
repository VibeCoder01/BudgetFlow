import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  description: string;
  currentValue: number; // Represents monthly value
  maxValue: number;
  icon: string; // Name of the lucide-react icon
  isActive: boolean;
  isPredefined: boolean;
}

// Helper type for category form data
export type CategoryFormData = Omit<Category, 'id' | 'icon' | 'isActive' | 'isPredefined'> & { icon?: string };
