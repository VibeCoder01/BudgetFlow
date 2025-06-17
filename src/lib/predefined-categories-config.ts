export interface PredefinedCategoryConfig {
  name: string;
  description: string;
  icon: string;
  defaultCurrentValue: number;
  defaultMaxValue: number;
  initiallyActive: boolean;
}

export const ALL_PREDEFINED_CATEGORIES_CONFIG: PredefinedCategoryConfig[] = [
  { name: 'Mortgage/Rent', description: 'Monthly housing payment', icon: 'Home', defaultCurrentValue: 1500, defaultMaxValue: 3000, initiallyActive: true },
  { name: 'Groceries', description: 'Food and household supplies', icon: 'ShoppingCart', defaultCurrentValue: 400, defaultMaxValue: 800, initiallyActive: true },
  { name: 'Utilities', description: 'Electricity, water, gas, internet', icon: 'Zap', defaultCurrentValue: 200, defaultMaxValue: 500, initiallyActive: true },
  { name: 'Transportation', description: 'Gas, public transport, car maintenance', icon: 'Car', defaultCurrentValue: 150, defaultMaxValue: 400, initiallyActive: true },
  { name: 'Credit Card Payments', description: 'Monthly credit card dues', icon: 'CreditCard', defaultCurrentValue: 300, defaultMaxValue: 1000, initiallyActive: true },
  { name: 'Healthcare', description: 'Insurance, medical bills, prescriptions', icon: 'Stethoscope', defaultCurrentValue: 0, defaultMaxValue: 300, initiallyActive: false },
  { name: 'Personal Care', description: 'Haircuts, toiletries, cosmetics', icon: 'Smile', defaultCurrentValue: 0, defaultMaxValue: 100, initiallyActive: false },
  { name: 'Entertainment', description: 'Movies, concerts, subscriptions', icon: 'Clapperboard', defaultCurrentValue: 0, defaultMaxValue: 200, initiallyActive: false },
  { name: 'Dining Out', description: 'Restaurants, cafes, takeaways', icon: 'Utensils', defaultCurrentValue: 0, defaultMaxValue: 250, initiallyActive: false },
  { name: 'Savings', description: 'Contributions to savings accounts', icon: 'PiggyBank', defaultCurrentValue: 0, defaultMaxValue: 500, initiallyActive: false },
  { name: 'Debt Repayment', description: 'Loans, credit cards (above minimum)', icon: 'Landmark', defaultCurrentValue: 0, defaultMaxValue: 400, initiallyActive: false },
  { name: 'Education', description: 'Tuition, books, courses', icon: 'BookOpen', defaultCurrentValue: 0, defaultMaxValue: 150, initiallyActive: false },
  { name: 'Childcare', description: 'Daycare, babysitting', icon: 'Baby', defaultCurrentValue: 0, defaultMaxValue: 800, initiallyActive: false },
  { name: 'Insurance (Other)', description: 'Life, car, home insurance', icon: 'ShieldCheck', defaultCurrentValue: 0, defaultMaxValue: 150, initiallyActive: false },
  { name: 'Gifts & Donations', description: 'Presents, charity', icon: 'Gift', defaultCurrentValue: 0, defaultMaxValue: 100, initiallyActive: false },
  { name: 'Travel/Vacation', description: 'Flights, accommodation, spending money', icon: 'Plane', defaultCurrentValue: 0, defaultMaxValue: 300, initiallyActive: false },
  { name: 'Fitness', description: 'Gym, classes, sports equipment', icon: 'Dumbbell', defaultCurrentValue: 0, defaultMaxValue: 75, initiallyActive: false },
  { name: 'Pets', description: 'Food, vet bills, supplies', icon: 'Dog', defaultCurrentValue: 0, defaultMaxValue: 100, initiallyActive: false },
];
