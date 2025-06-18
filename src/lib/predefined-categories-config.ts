
import type { CategoryType } from '@/types';

export interface PredefinedCategoryConfig {
  name: string;
  description: string;
  icon: string;
  defaultCurrentValue: number;
  defaultMaxValue: number;
  initiallyActive: boolean;
  type: CategoryType;
}

export const ALL_PREDEFINED_CATEGORIES_CONFIG: PredefinedCategoryConfig[] = [
  // Expenditure
  { name: 'Mortgage/Rent', description: 'Monthly housing payment', icon: 'Home', defaultCurrentValue: 1500, defaultMaxValue: 3000, initiallyActive: true, type: 'expenditure' },
  { name: 'Groceries', description: 'Food and household supplies', icon: 'ShoppingCart', defaultCurrentValue: 400, defaultMaxValue: 800, initiallyActive: true, type: 'expenditure' },
  { name: 'Utilities', description: 'Electricity, water, gas, internet', icon: 'Zap', defaultCurrentValue: 200, defaultMaxValue: 500, initiallyActive: true, type: 'expenditure' },
  { name: 'Transportation', description: 'Gas, public transport, car maintenance', icon: 'Car', defaultCurrentValue: 150, defaultMaxValue: 400, initiallyActive: true, type: 'expenditure' },
  { name: 'Credit Card Payments', description: 'Monthly credit card dues', icon: 'CreditCard', defaultCurrentValue: 300, defaultMaxValue: 1000, initiallyActive: true, type: 'expenditure' },
  { name: 'Healthcare', description: 'Insurance, medical bills, prescriptions', icon: 'Stethoscope', defaultCurrentValue: 0, defaultMaxValue: 300, initiallyActive: false, type: 'expenditure' },
  { name: 'Personal Care', description: 'Haircuts, toiletries, cosmetics', icon: 'Smile', defaultCurrentValue: 0, defaultMaxValue: 100, initiallyActive: false, type: 'expenditure' },
  { name: 'Entertainment', description: 'Movies, concerts, subscriptions', icon: 'Clapperboard', defaultCurrentValue: 0, defaultMaxValue: 200, initiallyActive: false, type: 'expenditure' },
  { name: 'Dining Out', description: 'Restaurants, cafes, takeaways', icon: 'Utensils', defaultCurrentValue: 0, defaultMaxValue: 250, initiallyActive: false, type: 'expenditure' },
  { name: 'Savings', description: 'Contributions to savings accounts', icon: 'PiggyBank', defaultCurrentValue: 0, defaultMaxValue: 500, initiallyActive: false, type: 'expenditure' },
  { name: 'Debt Repayment', description: 'Loans, credit cards (above minimum)', icon: 'Landmark', defaultCurrentValue: 0, defaultMaxValue: 400, initiallyActive: false, type: 'expenditure' },
  { name: 'Education', description: 'Tuition, books, courses', icon: 'BookOpen', defaultCurrentValue: 0, defaultMaxValue: 150, initiallyActive: false, type: 'expenditure' },
  { name: 'Childcare', description: 'Daycare, babysitting', icon: 'Baby', defaultCurrentValue: 0, defaultMaxValue: 800, initiallyActive: false, type: 'expenditure' },
  { name: 'Insurance (Other)', description: 'Life, car, home insurance', icon: 'ShieldCheck', defaultCurrentValue: 0, defaultMaxValue: 150, initiallyActive: false, type: 'expenditure' },
  { name: 'Gifts & Donations', description: 'Presents, charity', icon: 'Gift', defaultCurrentValue: 0, defaultMaxValue: 100, initiallyActive: false, type: 'expenditure' },
  { name: 'Travel/Vacation', description: 'Flights, accommodation, spending money', icon: 'Plane', defaultCurrentValue: 0, defaultMaxValue: 300, initiallyActive: false, type: 'expenditure' },
  { name: 'Fitness', description: 'Gym, classes, sports equipment', icon: 'Dumbbell', defaultCurrentValue: 0, defaultMaxValue: 75, initiallyActive: false, type: 'expenditure' },
  { name: 'Pets', description: 'Food, vet bills, supplies', icon: 'Dog', defaultCurrentValue: 0, defaultMaxValue: 100, initiallyActive: false, type: 'expenditure' },
  // Income
  { name: 'Salary', description: 'Primary employment income', icon: 'Briefcase', defaultCurrentValue: 3000, defaultMaxValue: 3500, initiallyActive: true, type: 'income' },
  { name: 'Freelance Income', description: 'Income from freelance work', icon: 'Laptop', defaultCurrentValue: 0, defaultMaxValue: 500, initiallyActive: false, type: 'income' },
  { name: 'Investment Dividends', description: 'Income from investments', icon: 'TrendingUp', defaultCurrentValue: 0, defaultMaxValue: 200, initiallyActive: false, type: 'income' },
  { name: 'Rental Income', description: 'Income from rental properties', icon: 'Building', defaultCurrentValue: 0, defaultMaxValue: 1000, initiallyActive: false, type: 'income' },
  { name: 'Bonus', description: 'Work-related bonus payments', icon: 'Award', defaultCurrentValue: 0, defaultMaxValue: 1000, initiallyActive: false, type: 'income' },
  { name: 'Interest Income', description: 'Interest earned from savings, bonds, etc.', icon: 'Percent', defaultCurrentValue: 0, defaultMaxValue: 100, initiallyActive: false, type: 'income' },
  { name: 'Gifts Received', description: 'Monetary gifts received', icon: 'Gift', defaultCurrentValue: 0, defaultMaxValue: 200, initiallyActive: false, type: 'income' },
];

