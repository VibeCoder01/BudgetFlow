
"use client";

import React from 'react';
import type { Category } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import DynamicIcon from '@/components/icons/dynamic-icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { PlusCircle } from 'lucide-react';

interface CategoryManagementSidebarProps {
  allCategories: Category[];
  onToggleCategoryActive: (categoryId: string, isActive: boolean) => void;
  onAddCategory: () => void;
}

const CategoryManagementSidebar: React.FC<CategoryManagementSidebarProps> = ({
  allCategories,
  onToggleCategoryActive,
  onAddCategory,
}) => {
  const predefinedExpenditure = allCategories.filter(cat => cat.isPredefined && cat.type === 'expenditure').sort((a, b) => a.name.localeCompare(b.name));
  const predefinedIncome = allCategories.filter(cat => cat.isPredefined && cat.type === 'income').sort((a, b) => a.name.localeCompare(b.name));
  const customExpenditure = allCategories.filter(cat => !cat.isPredefined && cat.type === 'expenditure').sort((a, b) => a.name.localeCompare(b.name));
  const customIncome = allCategories.filter(cat => !cat.isPredefined && cat.type === 'income').sort((a, b) => a.name.localeCompare(b.name));

  const renderCategorySection = (title: string, categories: Category[]) => {
    if (categories.length === 0) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarMenu>
          {categories.map((category) => (
            <SidebarMenuItem key={category.id} className="my-1">
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent transition-colors w-full">
                <Checkbox
                  id={`sidebar-cat-${category.id}`}
                  checked={category.isActive}
                  onCheckedChange={(checked) => onToggleCategoryActive(category.id, !!checked)}
                  aria-label={`Toggle ${category.name}`}
                />
                <Label
                  htmlFor={`sidebar-cat-${category.id}`}
                  className="flex-grow cursor-pointer text-sm flex items-center"
                >
                  <DynamicIcon name={category.icon} className="mr-2 text-sidebar-foreground/80" size={16} />
                  {category.name}
                </Label>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar side="right" collapsible="offcanvas" variant="sidebar">
      <SidebarHeader>
        <h3 className="font-headline text-lg font-semibold">Manage Categories</h3>
        <p className="text-xs text-muted-foreground">Toggle category visibility or add new ones.</p>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <ScrollArea className="flex-grow">
          <SidebarGroup>
            <SidebarGroupLabel>Actions</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                 <Button variant="outline" className="w-full justify-start" onClick={onAddCategory}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarSeparator className="my-4" />

          <SidebarGroupLabel>Category Visibility</SidebarGroupLabel>
          {renderCategorySection("Predefined Income", predefinedIncome)}
          {renderCategorySection("Predefined Expenditure", predefinedExpenditure)}
          {renderCategorySection("Custom Income", customIncome)}
          {renderCategorySection("Custom Expenditure", customExpenditure)}
          
           {allCategories.length === 0 && (
             <SidebarGroup>
                <p className="p-2 text-sm text-muted-foreground">No categories to manage yet. Add some!</p>
             </SidebarGroup>
           )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default CategoryManagementSidebar;
