
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Category, CategoryFormData } from '@/types';
import CategoryList from '@/components/budget-flow/category-list';
import BudgetOptimizer from '@/components/budget-flow/budget-optimizer';
import { Button } from '@/components/ui/button';
import { CategoryFormDialog } from '@/components/budget-flow/category-form-dialog';
import { PoundSterling, PlusCircle, Loader2 as MinimalLoader } from 'lucide-react'; // Renamed Loader2 to avoid conflict
import { DEFAULT_CATEGORY_ICON } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';


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

  useEffect(() => {
    setIsClient(true);
    // Load categories from localStorage if available
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
      currentValue: Math.min(data.currentValue, data.maxValue) // Ensure current value is not > max
    };
    setCategories((prev) => [...prev, newCategory]);
    toast({ title: "Category Added", description: `"${newCategory.name}" has been successfully added.` });
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? { ...cat, ...updatedCategory, currentValue: Math.min(updatedCategory.currentValue, updatedCategory.maxValue) } : cat))
    );
    // Debounce toast or only show on explicit save from dialog? For now, no toast on slider updates.
  };
  
  const handleEditCategorySubmit = (data: CategoryFormData, id?: string) => {
    if (!id) return; // Should not happen if editing
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

  if (!isClient) {
    // Render a loading state or null during server-side rendering and initial client-side mount
    // to avoid hydration mismatches with localStorage
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <MinimalLoader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading BudgetFlow...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-6 px-4 md:px-8 sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <PoundSterling className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-4xl font-bold tracking-tight">BudgetFlow</h1>
          </div>
          <Button onClick={openAddDialog} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Category
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="font-headline text-3xl font-semibold mb-6">Your Categories</h2>
            <CategoryList
              categories={categories}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onEditCategory={openEditDialog}
            />
          </div>
          <div className="lg:col-span-1 lg:sticky lg:top-24 self-start"> {/* Sticky AI Optimizer */}
             <h2 className="font-headline text-3xl font-semibold mb-6 lg:mt-0">Optimize Your Budget</h2>
            <BudgetOptimizer categories={categories} />
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
      
      <footer className="py-6 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} BudgetFlow. Crafted with care by Firebase Studio.</p>
      </footer>
    </div>
  );
}

// Minimal loader component was defined here but renamed to MinimalLoader to avoid import conflict if any
// For clarity, I'm using MinimalLoader which is imported from lucide-react directly.
// If the original Loader2 SVG component is preferred, it can be kept.
// For now, I'll assume lucide-react's Loader2 (aliased to MinimalLoader) is fine.
// const Loader2 = (props: React.SVGProps<SVGSVGElement>) => ( ... );
