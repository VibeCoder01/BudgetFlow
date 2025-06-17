
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Category, CategoryFormData } from '@/types';
import CategoryList from '@/components/budget-flow/category-list';
import { Button } from '@/components/ui/button';
import { CategoryFormDialog } from '@/components/budget-flow/category-form-dialog';
import { PoundSterling, PlusCircle, PieChart as PieChartIcon, BarChart2, Loader2 as MinimalLoader } from 'lucide-react';
import { DEFAULT_CATEGORY_ICON, WEEKS_IN_MONTH_APPROX } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import CategoryPieChart from '@/components/budget-flow/category-pie-chart';
import CategoryBarChart from '@/components/budget-flow/category-bar-chart';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


const INITIAL_CATEGORIES: Category[] = [
  { id: uuidv4(), name: 'Mortgage/Rent', description: 'Monthly housing payment', currentValue: 1500, maxValue: 3000, icon: 'Home' },
  { id: uuidv4(), name: 'Groceries', description: 'Food and household supplies', currentValue: 400, maxValue: 800, icon: 'ShoppingCart' },
  { id: uuidv4(), name: 'Utilities', description: 'Electricity, water, gas, internet', currentValue: 200, maxValue: 500, icon: 'Zap' },
  { id: uuidv4(), name: 'Transportation', description: 'Gas, public transport, car maintenance', currentValue: 150, maxValue: 400, icon: 'Car' },
  { id: uuidv4(), name: 'Credit Card Payments', description: 'Monthly credit card dues', currentValue: 300, maxValue: 1000, icon: 'CreditCard' },
];


export default function BudgetFlowPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');


  useEffect(() => {
    setIsClient(true);
    const storedCategories = localStorage.getItem('budgetFlowCategories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(INITIAL_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('budgetFlowCategories', JSON.stringify(categories));
    }
  }, [categories, isClient]);

  const handleAddCategory = (data: CategoryFormData) => {
    const newCategory: Category = {
      id: uuidv4(),
      ...data,
      icon: data.icon || DEFAULT_CATEGORY_ICON,
      currentValue: Math.min(data.currentValue, data.maxValue)
    };
    setCategories((prev) => [...prev, newCategory]);
    toast({ title: "Category Added", description: `"${newCategory.name}" has been successfully added.` });
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? { ...cat, ...updatedCategory, currentValue: Math.min(updatedCategory.currentValue, updatedCategory.maxValue) } : cat))
    );
  };
  
  const handleEditCategorySubmit = (data: CategoryFormData, id?: string) => {
    if (!id) return; 
    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.id === id
          ? { ...cat, ...data, icon: data.icon || DEFAULT_CATEGORY_ICON, currentValue: Math.min(data.currentValue, data.maxValue) }
          : cat
      )
    );
    setEditingCategory(undefined);
    toast({ title: "Category Updated", description: `"${data.name}" has been successfully updated.` });
  };


  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    if (categoryToDelete) {
      toast({ title: "Category Deleted", description: `"${categoryToDelete.name}" has been deleted.`, variant: "destructive" });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setEditingCategory(undefined);
    setIsDialogOpen(true);
  };

  const budgetTotals = useMemo(() => {
    const monthly = categories.reduce((sum, cat) => sum + cat.currentValue, 0);
    const weekly = monthly / WEEKS_IN_MONTH_APPROX;
    const yearly = monthly * 12;
    return { monthly, weekly, yearly };
  }, [categories]);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <MinimalLoader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading BudgetFlow...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-4 md:px-8 sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-3">
            <div className="flex items-center gap-3 mb-3 sm:mb-0">
              <PoundSterling className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-3xl font-bold tracking-tight">BudgetFlow</h1>
            </div>
            <Button onClick={openAddDialog} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Category
            </Button>
          </div>
          {categories.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/50">
              <h3 className="text-xs font-medium text-muted-foreground mb-1 text-center sm:text-left">Budget Summary</h3>
              <div className="flex flex-wrap justify-around items-center gap-x-3 gap-y-1 text-center sm:text-left">
                <div className="flex items-baseline">
                  <span className="text-xs text-muted-foreground mr-1">Monthly:</span>
                  <span className="text-base font-semibold tracking-tight text-primary">£{budgetTotals.monthly.toFixed(2)}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xs text-muted-foreground mr-1">Weekly:</span>
                  <span className="text-sm font-medium text-foreground">£{budgetTotals.weekly.toFixed(2)}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xs text-muted-foreground mr-1">Yearly:</span>
                  <span className="text-sm font-medium text-foreground">£{budgetTotals.yearly.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div> 
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-semibold mb-2 sm:mb-0">Your Categories</h2>
            {categories.length > 0 && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="chart-toggle" className="text-sm font-medium text-muted-foreground">
                  Show Chart
                </Label>
                <Switch
                  id="chart-toggle"
                  checked={showChart}
                  onCheckedChange={setShowChart}
                  aria-label="Toggle chart"
                />
              </div>
            )}
          </div>

          {showChart && categories.length > 0 && (
            <div className="mb-8 p-4 border rounded-lg shadow-sm bg-card">
              <div className="flex justify-center items-center space-x-4 mb-4">
                <RadioGroup
                  value={chartType}
                  onValueChange={(value: 'pie' | 'bar') => setChartType(value)}
                  className="flex items-center space-x-2"
                  aria-label="Select chart type"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="pie" id="r-pie" />
                    <Label htmlFor="r-pie" className="cursor-pointer flex items-center">
                      <PieChartIcon className="h-4 w-4 mr-1 text-muted-foreground" /> Pie
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="bar" id="r-bar" />
                    <Label htmlFor="r-bar" className="cursor-pointer flex items-center">
                      <BarChart2 className="h-4 w-4 mr-1 text-muted-foreground" /> Bar
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {chartType === 'pie' ? (
                <CategoryPieChart categories={categories} />
              ) : (
                <CategoryBarChart categories={categories} />
              )}
            </div>
          )}

          <div>
            <CategoryList
              categories={categories}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onEditCategory={openEditDialog}
            />
          </div>
        </div>
      </main>

      <CategoryFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCategory(undefined);
        }}
        onSubmit={editingCategory ? handleEditCategorySubmit : handleAddCategory}
        initialData={editingCategory}
      />
      
      <footer className="py-4 text-center text-sm text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} BudgetFlow. Crafted with care by Firebase Studio.</p>
      </footer>
    </div>
  );
}
