
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Category, CategoryFormData, Scenario, CategoryType } from '@/types';
import CategoryList from '@/components/budget-flow/category-list';
import { Button } from '@/components/ui/button';
import { CategoryFormDialog } from '@/components/budget-flow/category-form-dialog';
import { ScenarioFormDialog } from '@/components/budget-flow/scenario-form-dialog';
import ScenarioControls from '@/components/budget-flow/scenario-controls';
import { PlusCircle, Loader2 as MinimalLoader, ArrowDownUp, PieChart as PieChartIcon, BarChart2, Settings2, Upload, Download } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportDataToCsv, exportDataToXlsx, parseImportedFile, transformImportedDataToScenarios } from '@/lib/file-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function BudgetFlowPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const [isScenarioFormOpen, setIsScenarioFormOpen] = useState(false);
  const [scenarioFormMode, setScenarioFormMode] = useState<'create' | 'rename'>('create');
  const [scenarioToDeleteId, setScenarioToDeleteId] = useState<string | null>(null);

  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);


  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const [showExpenditureChart, setShowExpenditureChart] = useState(false);
  const [expenditureChartType, setExpenditureChartType] = useState<'pie' | 'bar'>('pie');
  const [showIncomeChart, setShowIncomeChart] = useState(false);
  const [incomeChartType, setIncomeChartType] = useState<'pie' | 'bar'>('pie');

  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenarioId);
  }, [scenarios, activeScenarioId]);

  const currentCategories = useMemo(() => {
    return activeScenario?.categories || [];
  }, [activeScenario]);

  const initializeDefaultScenario = useCallback(() => {
    const defaultCategories: Category[] = ALL_PREDEFINED_CATEGORIES_CONFIG.map(config => ({
      id: uuidv4(),
      name: config.name,
      description: config.description,
      currentValue: 0,
      maxValue: Math.round(config.defaultMaxValue),
      icon: config.icon || DEFAULT_CATEGORY_ICON,
      isActive: false,
      isPredefined: true,
      type: config.type as CategoryType,
    }));
    const firstScenario: Scenario = { id: uuidv4(), name: "First Scenario", categories: defaultCategories };
    setScenarios([firstScenario]);
    setActiveScenarioId(firstScenario.id);
  }, []);

  useEffect(() => {
    setIsClient(true);
    const storedScenariosRaw = localStorage.getItem('budgetFlowScenarios');
    const storedActiveScenarioId = localStorage.getItem('budgetFlowActiveScenarioId');

    if (storedScenariosRaw) {
      try {
        const parsedScenarios = JSON.parse(storedScenariosRaw) as Scenario[];
        if (parsedScenarios.length > 0) {
          const updatedScenarios = parsedScenarios.map(scenario => {
            let currentScenarioCategories = scenario.categories.map(cat => ({
              ...cat,
              isActive: cat.isActive === undefined ? true : cat.isActive,
              isPredefined: cat.isPredefined === undefined ? false : cat.isPredefined,
              type: cat.type || 'expenditure' as CategoryType,
              currentValue: Math.round(cat.currentValue || 0),
              maxValue: Math.round(cat.maxValue || (cat.type === 'income' ? cat.currentValue || 0 : 1000)),
            }));

            ALL_PREDEFINED_CATEGORIES_CONFIG.forEach(predefinedCatConfig => {
              const existsInScenario = currentScenarioCategories.some(
                scenCat => scenCat.isPredefined && scenCat.name === predefinedCatConfig.name
              );

              if (!existsInScenario) {
                currentScenarioCategories.push({
                  id: uuidv4(),
                  name: predefinedCatConfig.name,
                  description: predefinedCatConfig.description,
                  currentValue: 0, 
                  maxValue: Math.round(predefinedCatConfig.defaultMaxValue),
                  icon: predefinedCatConfig.icon || DEFAULT_CATEGORY_ICON,
                  isActive: false,
                  isPredefined: true,
                  type: predefinedCatConfig.type as CategoryType,
                });
              }
            });
            return { ...scenario, categories: currentScenarioCategories };
          });

          setScenarios(updatedScenarios);
          
          if (storedActiveScenarioId && updatedScenarios.some(s => s.id === storedActiveScenarioId)) {
            setActiveScenarioId(storedActiveScenarioId);
          } else if (updatedScenarios.length > 0) {
            setActiveScenarioId(updatedScenarios[0].id);
          } else {
             initializeDefaultScenario(); 
          }
        } else {
          initializeDefaultScenario();
        }
      } catch (error) {
        console.error("Failed to parse or update scenarios from localStorage", error);
        initializeDefaultScenario();
      }
    } else {
      initializeDefaultScenario();
    }
  }, [initializeDefaultScenario]);

  useEffect(() => {
    if (isClient && scenarios.length > 0 && activeScenarioId) {
      localStorage.setItem('budgetFlowScenarios', JSON.stringify(scenarios));
      localStorage.setItem('budgetFlowActiveScenarioId', activeScenarioId);
    }
  }, [scenarios, activeScenarioId, isClient]);

  const activeDisplayedCategories = useMemo(() => {
    return currentCategories.filter(cat => cat.isActive);
  }, [currentCategories]);

  const activeIncomeCategories = useMemo(() => {
    return activeDisplayedCategories.filter(cat => cat.type === 'income');
  }, [activeDisplayedCategories]);

  const activeExpenditureCategories = useMemo(() => {
    return activeDisplayedCategories.filter(cat => cat.type === 'expenditure');
  }, [activeDisplayedCategories]);

  const handleAddCategory = (data: CategoryFormData) => {
    if (!activeScenarioId) return;
    const roundedCurrentValue = Math.round(data.currentValue);
    const roundedMaxValue = Math.round(data.maxValue);

    const newCategory: Category = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      currentValue: Math.min(roundedCurrentValue, roundedMaxValue),
      maxValue: roundedMaxValue,
      icon: data.icon || DEFAULT_CATEGORY_ICON,
      isActive: true,
      isPredefined: false,
      type: data.type,
    };
    
    setScenarios(prevScenarios =>
      prevScenarios.map(scenario =>
        scenario.id === activeScenarioId
          ? { ...scenario, categories: [...scenario.categories, newCategory] }
          : scenario
      )
    );
    toast({ title: "Category Added", description: `"${newCategory.name}" has been successfully added to "${activeScenario?.name}".` });
  };

  const handleEditCategorySubmit = (data: CategoryFormData, id?: string) => {
    if (!id || !activeScenarioId) return;

    const originalCategory = currentCategories.find(cat => cat.id === id);
    if (!originalCategory) return;

    const roundedCurrentValue = Math.round(data.currentValue);
    const roundedMaxValue = Math.round(data.maxValue);

    if (originalCategory.isPredefined && originalCategory.name !== data.name) {
      const newCustomCategory: Category = {
        id: uuidv4(), 
        name: data.name,
        description: data.description,
        currentValue: Math.min(roundedCurrentValue, roundedMaxValue),
        maxValue: roundedMaxValue,
        icon: data.icon || DEFAULT_CATEGORY_ICON,
        isActive: true, 
        isPredefined: false, 
        type: data.type,
      };

      setScenarios(prevScenarios =>
        prevScenarios.map(scenario => {
          if (scenario.id === activeScenarioId) {
            const updatedCategories = scenario.categories.map(cat =>
              cat.id === id ? { ...cat, isActive: false } : cat 
            );
            updatedCategories.push(newCustomCategory); 
            return { ...scenario, categories: updatedCategories };
          }
          return scenario;
        })
      );
      setEditingCategory(undefined);
      toast({
        title: "Category Customized",
        description: `"${originalCategory.name}" was deactivated. A new custom category "${newCustomCategory.name}" has been created.`,
      });

    } else {
      setScenarios(prevScenarios =>
        prevScenarios.map(scenario =>
          scenario.id === activeScenarioId
            ? {
                ...scenario,
                categories: scenario.categories.map(cat =>
                  cat.id === id
                    ? {
                        ...cat,
                        name: data.name,
                        description: data.description,
                        currentValue: Math.min(roundedCurrentValue, roundedMaxValue),
                        maxValue: roundedMaxValue,
                        icon: data.icon || DEFAULT_CATEGORY_ICON,
                        type: data.type,
                      }
                    : cat
                ),
              }
            : scenario
        )
      );
      setEditingCategory(undefined);
      toast({ title: "Category Updated", description: `"${data.name}" has been successfully updated in "${activeScenario?.name}".` });
    }
  };

  const handleUpdateCategoryValues = (updatedCategory: Category) => {
    if (!activeScenarioId) return;
    const roundedCurrentValue = Math.round(updatedCategory.currentValue);
    const roundedMaxValue = Math.round(updatedCategory.maxValue);
    const finalCurrentValue = Math.min(roundedCurrentValue, roundedMaxValue);
    
    setScenarios(prevScenarios =>
      prevScenarios.map(scenario =>
        scenario.id === activeScenarioId
          ? {
              ...scenario,
              categories: scenario.categories.map(cat =>
                cat.id === updatedCategory.id ? { ...cat, currentValue: finalCurrentValue, maxValue: roundedMaxValue } : cat
              ),
            }
          : scenario
      )
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!activeScenarioId) return;
    const categoryToDelete = currentCategories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) return;

    if (categoryToDelete.isPredefined) {
      setScenarios(prevScenarios =>
        prevScenarios.map(scenario =>
          scenario.id === activeScenarioId
            ? {
                ...scenario,
                categories: scenario.categories.map(cat => cat.id === categoryId ? { ...cat, isActive: false } : cat),
              }
            : scenario
        )
      );
      toast({ title: "Category Deactivated", description: `"${categoryToDelete.name}" is now hidden in "${activeScenario?.name}".` });
    } else {
      setScenarios(prevScenarios =>
        prevScenarios.map(scenario =>
          scenario.id === activeScenarioId
            ? {
                ...scenario,
                categories: scenario.categories.filter(cat => cat.id !== categoryId),
              }
            : scenario
        )
      );
      toast({ title: "Category Deleted", description: `"${categoryToDelete.name}" has been permanently deleted from "${activeScenario?.name}".`, variant: "destructive" });
    }
  };

  const handleToggleCategoryActive = (categoryId: string, isActive: boolean) => {
    if (!activeScenarioId) return;
    const category = currentCategories.find(c => c.id === categoryId);
    
    setScenarios(prevScenarios =>
      prevScenarios.map(scenario =>
        scenario.id === activeScenarioId
          ? {
              ...scenario,
              categories: scenario.categories.map(cat => cat.id === categoryId ? { ...cat, isActive } : cat),
            }
          : scenario
      )
    );

    if (category) {
      toast({
        title: `Category ${isActive ? 'Activated' : 'Deactivated'}`,
        description: `"${category.name}" is now ${isActive ? 'visible' : 'hidden'} in "${activeScenario?.name}".`,
      });
    }
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const openAddCategoryDialog = () => {
    setEditingCategory(undefined);
    setIsCategoryDialogOpen(true);
  };

  const calculateTotals = (categoriesToSum: Category[]) => {
    const monthly = categoriesToSum.reduce((sum, cat) => sum + cat.currentValue, 0);
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

  const handleSwitchScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    toast({title: "Scenario Switched", description: `Now viewing "${scenarios.find(s=>s.id === scenarioId)?.name}".`})
  };

  const handleOpenCreateScenarioDialog = () => {
    setScenarioFormMode('create');
    setIsScenarioFormOpen(true);
  };

  const handleOpenRenameScenarioDialog = () => {
    setScenarioFormMode('rename');
    setIsScenarioFormOpen(true);
  };

  const handleScenarioFormSubmit = (name: string) => {
    if (scenarioFormMode === 'create') {
      if (!activeScenario) {
        toast({title: "Error", description: "No active scenario to duplicate from.", variant: "destructive"});
        return;
      }
      const newScenarioCategories = JSON.parse(JSON.stringify(activeScenario.categories)) as Category[];
      const trulyNewCategories = newScenarioCategories.map(cat => ({
        ...cat,
        id: uuidv4(), 
      }));

      const newScenario: Scenario = {
        id: uuidv4(),
        name,
        categories: trulyNewCategories,
      };
      setScenarios(prev => [...prev, newScenario]);
      setActiveScenarioId(newScenario.id);
      toast({title: "Scenario Created", description: `"${name}" created and activated.`});
    } else if (scenarioFormMode === 'rename' && activeScenarioId) {
      setScenarios(prev => prev.map(s => s.id === activeScenarioId ? {...s, name} : s));
      toast({title: "Scenario Renamed", description: `Scenario renamed to "${name}".`});
    }
    setIsScenarioFormOpen(false);
  };

  const promptDeleteScenario = (scenarioId: string) => {
    setScenarioToDeleteId(scenarioId);
  };

  const confirmDeleteScenario = () => {
    if (!scenarioToDeleteId) return;

    const scenarioBeingDeleted = scenarios.find(s => s.id === scenarioToDeleteId);
    if (!scenarioBeingDeleted) {
      setScenarioToDeleteId(null);
      return;
    }
    const scenarioName = scenarioBeingDeleted.name;

    const updatedScenarios = scenarios.filter(s => s.id !== scenarioToDeleteId);

    if (updatedScenarios.length === 0) {
      initializeDefaultScenario();
      toast({
        title: "Final Scenario Deleted",
        description: `"${scenarioName}" was removed. The application has been reset to the default scenario.`,
        variant: "destructive",
      });
    } else {
      let newActiveScenarioId = activeScenarioId;
      if (activeScenarioId === scenarioToDeleteId) {
        newActiveScenarioId = updatedScenarios[0].id;
      }
      setScenarios(updatedScenarios);
      setActiveScenarioId(newActiveScenarioId);
      toast({
        title: "Scenario Deleted",
        description: `"${scenarioName}" has been deleted.`,
        variant: "destructive",
      });
    }

    setScenarioToDeleteId(null);
  };

  const handleExportData = (format: 'csv' | 'xlsx') => {
    if (scenarios.length === 0) {
      toast({ title: "No Data", description: "There is no data to export.", variant: "destructive" });
      return;
    }

    const flatData = scenarios.flatMap(scenario =>
      scenario.categories.map(category => ({
        ScenarioID: scenario.id,
        ScenarioName: scenario.name,
        CategoryID: category.id,
        CategoryName: category.name,
        Description: category.description,
        CurrentValue: category.currentValue,
        MaxValue: category.maxValue,
        Icon: category.icon,
        IsActive: category.isActive,
        IsPredefined: category.isPredefined,
        Type: category.type,
      }))
    );

    try {
      if (format === 'csv') {
        exportDataToCsv(flatData, 'budgetflow_data.csv');
      } else {
        exportDataToXlsx(flatData, 'budgetflow_data.xlsx');
      }
      toast({ title: "Export Successful", description: `Data exported as ${format.toUpperCase()}.` });
    } catch (error) {
      console.error("Export failed:", error);
      toast({ title: "Export Failed", description: "Could not export data.", variant: "destructive" });
    }
  };

  const handleImportTrigger = () => {
    importFileInputRef.current?.click();
  };

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToImport(file);
      setIsImportConfirmOpen(true);
    }
    if (event.target) {
      event.target.value = "";
    }
  };
  
  const processAndImportData = async () => {
    if (!fileToImport) return;

    try {
      const parsedFlatData = await parseImportedFile(fileToImport);
      const newScenarios = transformImportedDataToScenarios(parsedFlatData);

      if (newScenarios.length === 0) {
        toast({ title: "Import Warning", description: "No valid scenario data found in the file.", variant: "destructive" });
        setIsImportConfirmOpen(false);
        setFileToImport(null);
        return;
      }
      
      setScenarios(newScenarios);
      setActiveScenarioId(newScenarios[0]?.id || null); 
      localStorage.setItem('budgetFlowScenarios', JSON.stringify(newScenarios));
      if (newScenarios[0]) {
         localStorage.setItem('budgetFlowActiveScenarioId', newScenarios[0].id);
      } else {
         localStorage.removeItem('budgetFlowActiveScenarioId');
      }
      toast({ title: "Import Successful", description: "Data imported and replaced successfully." });
    } catch (error: any) {
      console.error("Import failed:", error);
      toast({ title: "Import Failed", description: error.message || "Could not parse or import file.", variant: "destructive" });
    } finally {
      setIsImportConfirmOpen(false);
      setFileToImport(null);
    }
  };


  if (!isClient || !activeScenarioId || !activeScenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <MinimalLoader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading BudgetFlow...</p>
      </div>
    );
  }
  
  const renderTotalsRow = (
    title: string,
    totals: { monthly: number; weekly: number; yearly: number },
    valueColorClass: string = "text-primary"
  ) => {
    const isNetBalance = title === "Net Balance";
    const titleSize = isNetBalance ? "text-2xl" : "text-xl";
    const valueSize = isNetBalance ? "text-3xl" : "text-2xl";
    
    return (
      <div className="grid grid-cols-5 items-baseline gap-x-1 py-0.5">
        <span className={`col-span-2 font-semibold ${titleSize} text-right pr-2`}>{title}:</span>
        <span className={`col-span-1 ${valueSize} font-semibold ${valueColorClass} text-right`}>
          £{Math.round(totals.monthly).toString()}
        </span>
        <span className={`col-span-1 ${valueSize} font-semibold ${valueColorClass} text-right`}>
          £{Math.round(totals.weekly).toString()}
        </span>
        <span className={`col-span-1 ${valueSize} font-semibold ${valueColorClass} text-right`}>
          £{Math.round(totals.yearly).toString()}
        </span>
      </div>
    );
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col min-h-screen bg-background">
        <SidebarInset>
          <header className="py-1 px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b">
            <div className="mx-auto flex w-full items-center justify-between gap-6">
              {/* Left: Title */}
              <div className="flex items-center gap-2 flex-1">
                <ArrowDownUp className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-5xl font-bold tracking-tight">BudgetFlow</h1>
              </div>

              {/* Middle: Scenario Chooser */}
              <div className="hidden md:flex flex-1 justify-center">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Scenario</Label>
                  <Select onValueChange={handleSwitchScenario} value={activeScenarioId}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Select scenario..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map(scenario => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: Manager Buttons */}
              <div className="flex flex-1 items-center justify-end gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarTrigger variant="default" size="sm">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Category Manager
                      </SidebarTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manage Categories</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <ScenarioControls
                  activeScenarioId={activeScenarioId}
                  onCreateScenario={handleOpenCreateScenarioDialog}
                  onRenameScenario={handleOpenRenameScenarioDialog}
                  onDeleteScenario={promptDeleteScenario}
                  onExportData={handleExportData}
                  onImportRequest={handleImportTrigger}
                />
              </div>
            </div>
            {(activeIncomeCategories.length > 0 || activeExpenditureCategories.length > 0) && (
                 <div className="mt-0 pt-0.5 border-t border-border/50">
                    <div className="grid grid-cols-5 items-baseline gap-x-1 pt-0.5 pb-1">
                        <span className="col-span-2 text-base font-medium text-muted-foreground text-right pr-2">Breakdown for: {activeScenario.name}</span>
                        <span className="col-span-1 text-lg font-medium text-muted-foreground text-right">Monthly</span>
                        <span className="col-span-1 text-lg font-medium text-muted-foreground text-right">Weekly</span>
                        <span className="col-span-1 text-lg font-medium text-muted-foreground text-right">Yearly</span>
                    </div>

                    {activeIncomeCategories.length > 0 && renderTotalsRow("Total Income", incomeTotals, "text-green-600 dark:text-green-400")}
                    {activeExpenditureCategories.length > 0 && renderTotalsRow("Total Expenditure", expenditureTotals, "text-red-600 dark:text-red-400")}
                    
                    {(activeIncomeCategories.length > 0 || activeExpenditureCategories.length > 0) && (
                        <>
                            <Separator className="my-1"/>
                            {renderTotalsRow("Net Balance", netTotals, netTotals.monthly >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400")}
                        </>
                    )}
                 </div>
            )}
          </header>

          <main className="flex-grow p-4 md:p-6">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-4">
                <h2 className="font-headline text-2xl font-semibold mb-2 sm:mb-0">
                  Categories for: <span className="text-primary">{activeScenario.name}</span>
                </h2>
                <div className="flex items-center gap-4">
                  {activeIncomeCategories.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="income-chart-toggle" className="text-xs font-medium text-muted-foreground">
                        Show Income Chart
                      </Label>
                      <Switch
                        id="income-chart-toggle"
                        checked={showIncomeChart}
                        onCheckedChange={setShowIncomeChart}
                        aria-label="Toggle income chart"
                      />
                    </div>
                  )}
                  {activeExpenditureCategories.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="expenditure-chart-toggle" className="text-xs font-medium text-muted-foreground">
                        Show Spending Chart
                      </Label>
                      <Switch
                        id="expenditure-chart-toggle"
                        checked={showExpenditureChart}
                        onCheckedChange={setShowExpenditureChart}
                        aria-label="Toggle spending chart"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {showIncomeChart && activeIncomeCategories.length > 0 && (
                <div className="mb-6 p-3 border rounded-lg shadow-sm bg-card">
                  <div className="flex justify-center items-center space-x-3 mb-3">
                    <RadioGroup
                      value={incomeChartType}
                      onValueChange={(value: 'pie' | 'bar') => setIncomeChartType(value)}
                      className="flex items-center space-x-1.5"
                      aria-label="Select income chart type"
                    >
                      <div className="flex items-center space-x-0.5">
                        <RadioGroupItem value="pie" id="r-income-pie" />
                        <Label htmlFor="r-income-pie" className="cursor-pointer flex items-center text-xs">
                          <PieChartIcon className="h-3 w-3 mr-1 text-muted-foreground" /> Pie
                        </Label>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        <RadioGroupItem value="bar" id="r-income-bar" />
                        <Label htmlFor="r-income-bar" className="cursor-pointer flex items-center text-xs">
                          <BarChart2 className="h-3 w-3 mr-1 text-muted-foreground" /> Bar
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {incomeChartType === 'pie' ? (
                    <CategoryPieChart categories={activeIncomeCategories} title="Income Distribution" />
                  ) : (
                    <CategoryBarChart categories={activeIncomeCategories} title="Income Breakdown" />
                  )}
                </div>
              )}

              {showExpenditureChart && activeExpenditureCategories.length > 0 && (
                <div className="mb-6 p-3 border rounded-lg shadow-sm bg-card">
                  <div className="flex justify-center items-center space-x-3 mb-3">
                    <RadioGroup
                      value={expenditureChartType}
                      onValueChange={(value: 'pie' | 'bar') => setExpenditureChartType(value)}
                      className="flex items-center space-x-1.5"
                      aria-label="Select expenditure chart type"
                    >
                      <div className="flex items-center space-x-0.5">
                        <RadioGroupItem value="pie" id="r-exp-pie" />
                        <Label htmlFor="r-exp-pie" className="cursor-pointer flex items-center text-xs">
                          <PieChartIcon className="h-3 w-3 mr-1 text-muted-foreground" /> Pie
                        </Label>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        <RadioGroupItem value="bar" id="r-exp-bar" />
                        <Label htmlFor="r-exp-bar" className="cursor-pointer flex items-center text-xs">
                          <BarChart2 className="h-3 w-3 mr-1 text-muted-foreground" /> Bar
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {expenditureChartType === 'pie' ? (
                    <CategoryPieChart categories={activeExpenditureCategories} />
                  ) : (
                    <CategoryBarChart categories={activeExpenditureCategories} />
                  )}
                </div>
              )}

              <div>
                <CategoryList
                  categories={activeDisplayedCategories}
                  onUpdateCategory={handleUpdateCategoryValues}
                  onDeleteCategory={handleDeleteCategory}
                  onEditCategory={openEditCategoryDialog}
                />
              </div>
            </div>
          </main>

          <CategoryFormDialog
            isOpen={isCategoryDialogOpen}
            onClose={() => {
              setIsCategoryDialogOpen(false);
              setEditingCategory(undefined);
            }}
            onSubmit={editingCategory ? handleEditCategorySubmit : handleAddCategory}
            initialData={editingCategory}
          />

          <ScenarioFormDialog
            isOpen={isScenarioFormOpen}
            onClose={() => setIsScenarioFormOpen(false)}
            onSubmit={handleScenarioFormSubmit}
            mode={scenarioFormMode}
            initialName={scenarioFormMode === 'rename' ? activeScenario?.name : undefined}
          />

          <AlertDialog open={!!scenarioToDeleteId} onOpenChange={(open) => !open && setScenarioToDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the scenario
                  "{scenarios.find(s => s.id === scenarioToDeleteId)?.name || ''}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setScenarioToDeleteId(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteScenario}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={isImportConfirmOpen} onOpenChange={setIsImportConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Import</AlertDialogTitle>
                <AlertDialogDescription>
                  Importing this file will replace ALL existing scenarios and categories. This action cannot be undone. Are you sure you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setIsImportConfirmOpen(false); setFileToImport(null); }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={processAndImportData}>Import and Replace</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleImportFileSelect}
            accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
          />


          <footer className="py-0.5 text-center text-xs text-muted-foreground border-t mt-6">
            <p>Copyright Shaun Dunmall {new Date().getFullYear()}</p>
          </footer>
        </SidebarInset>
        <CategoryManagementSidebar
          allCategories={currentCategories}
          onToggleCategoryActive={handleToggleCategoryActive}
          onAddCategory={openAddCategoryDialog}
        />
      </div>
    </SidebarProvider>
  );
}
    

    

    







    

    

    

    

    
