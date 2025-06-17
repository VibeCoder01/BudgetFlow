
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Category, CategoryFormData } from '@/types';
import CategoryList from '@/components/budget-flow/category-list';
import { Button } from '@/components/ui/button';
import { CategoryFormDialog } from '@/components/budget-flow/category-form-dialog';
import { PoundSterling, PlusCircle, PieChart as PieChartIcon, BarChart2, Loader2 as MinimalLoader, Settings2 } from 'lucide-react';
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
        // Ensure all categories have the new fields, important for migration
        setManagedCategories(parsedCategories.map(cat => ({
          ...cat,
          isActive: cat.isActive === undefined ? true : cat.isActive, // Default to active if migrating
          isPredefined: cat.isPredefined === undefined ? false : cat.isPredefined, // Default to not predefined if migrating
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
      currentValue: config.defaultCurrentValue,
      maxValue: config.defaultMaxValue,
      icon: config.icon || DEFAULT_CATEGORY_ICON,
      isActive: config.initiallyActive,
      isPredefined: true,
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

  const handleAddCategory = (data: CategoryFormData) => {
    const newCategory: Category = {
      id: uuidv4(),
      ...data,
      icon: data.icon || DEFAULT_CATEGORY_ICON,
      currentValue: Math.min(data.currentValue, data.maxValue),
      isActive: true,
      isPredefined: false,
    };
    setManagedCategories((prev) => [...prev, newCategory]);
    toast({ title: "Category Added", description: `"${newCategory.name}" has been successfully added.` });
  };
  
  const handleEditCategorySubmit = (data: CategoryFormData, id?: string) => {
    if (!id) return; 
    setManagedCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.id === id
          ? { ...cat, ...data, icon: data.icon || DEFAULT_CATEGORY_ICON, currentValue: Math.min(data.currentValue, data.maxValue) }
          : cat
      )
    );
    setEditingCategory(undefined);
    toast({ title: "Category Updated", description: `"${data.name}" has been successfully updated.` });
  };

  const handleUpdateCategoryValues = (updatedCategory: Category) => {
    setManagedCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? { ...cat, ...updatedCategory, currentValue: Math.min(updatedCategory.currentValue, updatedCategory.maxValue) } : cat))
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

  const budgetTotals = useMemo(() => {
    const monthly = activeCategories.reduce((sum, cat) => sum + cat.currentValue, 0);
    const weekly = monthly / WEEKS_IN_MONTH_APPROX;
    const yearly = monthly * 12;
    return { monthly, weekly, yearly };
  }, [activeCategories]);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <MinimalLoader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading BudgetFlow...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col min-h-screen bg-background">
        <SidebarInset>
          <header className="py-3 px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b">
            <div className="container mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <PoundSterling className="h-7 w-7 text-primary" />
                  <h1 className="font-headline text-2xl font-bold tracking-tight">BudgetFlow</h1>
                </div>
                <div className="flex items-center gap-2">
                   <SidebarTrigger variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                     <Settings2 />
                   </SidebarTrigger>
                  <Button onClick={openAddDialog} size="default">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                  </Button>
                </div>
              </div>
              {activeCategories.length > 0 && (
                <div className="mt-2 pt-1 border-t border-border/50">
                  <h3 className="text-xs font-medium text-muted-foreground mb-0.5 text-center sm:text-left">Budget Summary</h3>
                  <div className="flex flex-wrap justify-around items-center gap-x-2 gap-y-0.5 text-center sm:text-left">
                    <div className="flex items-baseline">
                      <span className="text-xs text-muted-foreground mr-1">Monthly:</span>
                      <span className="text-sm font-semibold tracking-tight text-primary">£{budgetTotals.monthly.toFixed(2)}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-xs text-muted-foreground mr-1">Weekly:</span>
                      <span className="text-xs font-medium text-foreground">£{budgetTotals.weekly.toFixed(2)}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-xs text-muted-foreground mr-1">Yearly:</span>
                      <span className="text-xs font-medium text-foreground">£{budgetTotals.yearly.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="flex-grow container mx-auto p-4 md:p-6">
            <div> 
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="font-headline text-2xl font-semibold mb-2 sm:mb-0">Your Active Categories</h2>
                {activeCategories.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="chart-toggle" className="text-xs font-medium text-muted-foreground">
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

              {showChart && activeCategories.length > 0 && (
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
                    <CategoryPieChart categories={activeCategories} />
                  ) : (
                    <CategoryBarChart categories={activeCategories} />
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
          
          <footer className="py-3 text-center text-xs text-muted-foreground border-t mt-8">
            <p>&copy; {new Date().getFullYear()} BudgetFlow. Crafted with care by Firebase Studio.</p>
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
