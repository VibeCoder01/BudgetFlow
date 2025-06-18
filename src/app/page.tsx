
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Category, CategoryFormData, CategoryType } from '@/types';
import CategoryList from '@/components/budget-flow/category-list';
import { Button } from '@/components/ui/button';
import { CategoryFormDialog } from '@/components/budget-flow/category-form-dialog';
import { PoundSterling, PlusCircle, PieChart as PieChartIcon, BarChart2, Loader2 as MinimalLoader, Settings2, ArrowDownUp } from 'lucide-react';
import { DEFAULT_CATEGORY_ICON, WEEKS_IN_MONTH_APPROX } from '@/lib/constants';
import { ALL_PREDEFINED_CATEGORIES_CONFIG } from '@/lib/predefined-categories-config';
import { useToast } from '@/hooks/use-toast';
import CategoryPieChart from '@/components/budget-flow/category-pie-chart';
import CategoryBarChart from '@/components/budget-flow/category-bar-chart';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import CategoryManagementSidebar from '@/components/budget-flow/category-management-sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';


export default function BudgetFlowPage() {
  const [managedCategories, setManagedCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  useEffect(() => {
    setIsClient(true);
    const storedCategories = localStorage.getItem('budgetFlowManagedCategories');
    if (storedCategories) {
      try {
        const parsedCategories = JSON.parse(storedCategories) as Category[];
        setManagedCategories(parsedCategories.map(cat => ({
          ...cat,
          isActive: cat.isActive === undefined ? true : cat.isActive,
          isPredefined: cat.isPredefined === undefined ? false : cat.isPredefined,
          type: cat.type || 'expenditure', // Ensure type exists
          currentValue: Math.round(cat.currentValue || 0),
          maxValue: Math.round(cat.maxValue || 0),
        })));
      } catch (error) {
        console.error("Failed to parse categories from localStorage", error);
        initializeDefaultCategories();
      }
    } else {
      initializeDefaultCategories();
    }
  }, []);

  const initializeDefaultCategories = () => {
    const defaultCategories: Category[] = ALL_PREDEFINED_CATEGORIES_CONFIG.map(config => ({
      id: uuidv4(),
      name: config.name,
      description: config.description,
      currentValue: Math.round(config.defaultCurrentValue),
      maxValue: Math.round(config.defaultMaxValue),
      icon: config.icon || DEFAULT_CATEGORY_ICON,
      isActive: config.initiallyActive,
      isPredefined: true,
      type: config.type,
    }));
    setManagedCategories(defaultCategories);
  };

  useEffect(() => {
    if (isClient && managedCategories.length > 0) {
      localStorage.setItem('budgetFlowManagedCategories', JSON.stringify(managedCategories));
    }
  }, [managedCategories, isClient]);

  const activeCategories = useMemo(() => {
    return managedCategories.filter(cat => cat.isActive);
  }, [managedCategories]);

  const activeIncomeCategories = useMemo(() => {
    return activeCategories.filter(cat => cat.type === 'income');
  }, [activeCategories]);

  const activeExpenditureCategories = useMemo(() => {
    return activeCategories.filter(cat => cat.type === 'expenditure');
  }, [activeCategories]);

  const handleAddCategory = (data: CategoryFormData) => {
    const roundedCurrentValue = Math.round(data.currentValue);
    let roundedMaxValue = Math.round(data.maxValue);

    if (data.type === 'income') {
      roundedMaxValue = roundedCurrentValue;
    }

    const newCategory: Category = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      currentValue: data.type === 'expenditure' ? Math.min(roundedCurrentValue, roundedMaxValue) : roundedCurrentValue,
      maxValue: roundedMaxValue,
      icon: data.icon || DEFAULT_CATEGORY_ICON,
      isActive: true,
      isPredefined: false,
      type: data.type,
    };
    setManagedCategories((prev) => [...prev, newCategory]);
    toast({ title: "Category Added", description: `"${newCategory.name}" has been successfully added.` });
  };

  const handleEditCategorySubmit = (data: CategoryFormData, id?: string) => {
    if (!id) return;
    const roundedCurrentValue = Math.round(data.currentValue);
    let roundedMaxValue = Math.round(data.maxValue);

    if (data.type === 'income') {
      roundedMaxValue = roundedCurrentValue;
    }

    setManagedCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              name: data.name,
              description: data.description,
              currentValue: data.type === 'expenditure' ? Math.min(roundedCurrentValue, roundedMaxValue) : roundedCurrentValue,
              maxValue: roundedMaxValue,
              icon: data.icon || DEFAULT_CATEGORY_ICON,
              type: data.type,
            }
          : cat
      )
    );
    setEditingCategory(undefined);
    toast({ title: "Category Updated", description: `"${data.name}" has been successfully updated.` });
  };

  const handleUpdateCategoryValues = (updatedCategory: Category) => {
    let updatedCurrentValue = updatedCategory.currentValue;
    let updatedMaxValue = updatedCategory.maxValue;

    if (updatedCategory.type === 'income') {
      updatedMaxValue = updatedCurrentValue;
    } else {
       updatedCurrentValue = Math.min(updatedCurrentValue, updatedMaxValue);
    }
    
    setManagedCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? { ...cat, currentValue: updatedCurrentValue, maxValue: updatedMaxValue } : cat))
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = managedCategories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) return;

    if (categoryToDelete.isPredefined) {
      setManagedCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, isActive: false } : cat));
      toast({ title: "Category Deactivated", description: `"${categoryToDelete.name}" is now hidden. You can reactivate it from the sidebar.` });
    } else {
      setManagedCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast({ title: "Category Deleted", description: `"${categoryToDelete.name}" has been permanently deleted.`, variant: "destructive" });
    }
  };

  const handleToggleCategoryActive = (categoryId: string, isActive: boolean) => {
    setManagedCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, isActive } : cat));
     const category = managedCategories.find(c => c.id === categoryId);
    if (category) {
      toast({
        title: `Category ${isActive ? 'Activated' : 'Deactivated'}`,
        description: `"${category.name}" is now ${isActive ? 'visible' : 'hidden'}.`,
      });
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

  const calculateTotals = (categories: Category[]) => {
    const monthly = categories.reduce((sum, cat) => sum + cat.currentValue, 0);
    const weekly = monthly / WEEKS_IN_MONTH_APPROX;
    const yearly = monthly * 12;
    return { monthly, weekly, yearly };
  };

  const incomeTotals = useMemo(() => calculateTotals(activeIncomeCategories), [activeIncomeCategories]);
  const expenditureTotals = useMemo(() => calculateTotals(activeExpenditureCategories), [activeExpenditureCategories]);
  
  const netTotals = useMemo(() => ({
    monthly: incomeTotals.monthly - expenditureTotals.monthly,
    weekly: incomeTotals.weekly - expenditureTotals.weekly,
    yearly: incomeTotals.yearly - expenditureTotals.yearly,
  }), [incomeTotals, expenditureTotals]);


  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <MinimalLoader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading BudgetFlow...</p>
      </div>
    );
  }

  const renderTotalsBlock = (title: string, totals: { monthly: number; weekly: number; yearly: number }, colorClass: string = "text-primary") => (
    <div className="mb-1.5">
      <h3 className="text-xs font-medium text-muted-foreground mb-0">{title}</h3>
      <div className="flex flex-wrap justify-start items-baseline gap-x-2 gap-y-0">
        <div className="flex items-baseline">
          <span className="text-xs text-muted-foreground mr-1">Monthly:</span>
          <span className={`text-base font-semibold tracking-tight ${colorClass}`}>£{Math.round(totals.monthly).toString()}</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-xs text-muted-foreground mr-1">Weekly:</span>
          <span className={`text-base font-semibold tracking-tight ${colorClass}`}>£{Math.round(totals.weekly).toString()}</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-xs text-muted-foreground mr-1">Yearly:</span>
          <span className={`text-base font-semibold tracking-tight ${colorClass}`}>£{Math.round(totals.yearly).toString()}</span>
        </div>
      </div>
    </div>
  );


  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col min-h-screen bg-background">
        <SidebarInset>
          <header className="py-1 px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b">
            <div className="container mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-0.5 gap-2 sm:gap-4">
                <div className="flex items-center gap-2 mb-1 sm:mb-0">
                  <ArrowDownUp className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  <h1 className="font-headline text-lg sm:text-xl font-bold tracking-tight">BudgetFlow</h1>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarTrigger variant="outline" size="icon" className="h-8 w-8">
                          <Settings2 />
                        </SidebarTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Category chooser</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button onClick={openAddDialog} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                  </Button>
                </div>
              </div>
              {(activeIncomeCategories.length > 0 || activeExpenditureCategories.length > 0) && (
                 <div className="mt-0 pt-0.5 border-t border-border/50">
                    {activeIncomeCategories.length > 0 && renderTotalsBlock("Total Income", incomeTotals, "text-green-600 dark:text-green-400")}
                    {activeExpenditureCategories.length > 0 && renderTotalsBlock("Total Expenditure", expenditureTotals, "text-red-600 dark:text-red-400")}
                    {(activeIncomeCategories.length > 0 || activeExpenditureCategories.length > 0) && (
                        <>
                            <Separator className="my-1"/>
                            {renderTotalsBlock("Net Balance", netTotals, netTotals.monthly >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400")}
                        </>
                    )}
                 </div>
              )}
            </div>
          </header>

          <main className="flex-grow container mx-auto p-4 md:p-6">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-4">
                <h2 className="font-headline text-2xl font-semibold mb-2 sm:mb-0">Your Active Categories</h2>
                {activeExpenditureCategories.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="chart-toggle" className="text-xs font-medium text-muted-foreground">
                      Show Spending Chart
                    </Label>
                    <Switch
                      id="chart-toggle"
                      checked={showChart}
                      onCheckedChange={setShowChart}
                      aria-label="Toggle spending chart"
                    />
                  </div>
                )}
              </div>

              {showChart && activeExpenditureCategories.length > 0 && (
                <div className="mb-6 p-3 border rounded-lg shadow-sm bg-card">
                  <div className="flex justify-center items-center space-x-3 mb-3">
                    <RadioGroup
                      value={chartType}
                      onValueChange={(value: 'pie' | 'bar') => setChartType(value)}
                      className="flex items-center space-x-1.5"
                      aria-label="Select chart type"
                    >
                      <div className="flex items-center space-x-0.5">
                        <RadioGroupItem value="pie" id="r-pie" />
                        <Label htmlFor="r-pie" className="cursor-pointer flex items-center text-xs">
                          <PieChartIcon className="h-3 w-3 mr-1 text-muted-foreground" /> Pie
                        </Label>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        <RadioGroupItem value="bar" id="r-bar" />
                        <Label htmlFor="r-bar" className="cursor-pointer flex items-center text-xs">
                          <BarChart2 className="h-3 w-3 mr-1 text-muted-foreground" /> Bar
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {chartType === 'pie' ? (
                    <CategoryPieChart categories={activeExpenditureCategories} />
                  ) : (
                    <CategoryBarChart categories={activeExpenditureCategories} />
                  )}
                </div>
              )}

              <div>
                <CategoryList
                  categories={activeCategories}
                  onUpdateCategory={handleUpdateCategoryValues}
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

          <footer className="py-0.5 text-center text-xs text-muted-foreground border-t mt-6">
            <p>Copyright Shaun Dunmall {new Date().getFullYear()}</p>
          </footer>
        </SidebarInset>
        <CategoryManagementSidebar
          allCategories={managedCategories}
          onToggleCategoryActive={handleToggleCategoryActive}
        />
      </div>
    </SidebarProvider>
  );
}
