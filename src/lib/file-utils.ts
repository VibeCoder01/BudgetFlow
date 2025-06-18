
import * as XLSX from 'xlsx';
import type { Scenario, Category, CategoryType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CATEGORY_ICON } from './constants';

interface FlatCategoryData {
  ScenarioID: string;
  ScenarioName: string;
  CategoryID: string;
  CategoryName: string;
  Description: string;
  CurrentValue: number;
  MaxValue: number;
  Icon: string;
  IsActive: boolean;
  IsPredefined: boolean;
  Type: CategoryType;
}

export function exportDataToCsv(data: FlatCategoryData[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportDataToXlsx(data: FlatCategoryData[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BudgetFlowData');
  XLSX.writeFile(workbook, filename);
}

export async function parseImportedFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file."));
          return;
        }
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error("Failed to parse file. Ensure it is a valid CSV or XLSX."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

const stringToBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return !!value; // Fallback for numbers or other types
};

export function transformImportedDataToScenarios(flatData: any[]): Scenario[] {
  const scenariosMap = new Map<string, Scenario>();

  flatData.forEach(row => {
    const scenarioID = typeof row.ScenarioID === 'string' ? row.ScenarioID : uuidv4();
    const scenarioName = typeof row.ScenarioName === 'string' ? row.ScenarioName : 'Imported Scenario';
    
    let scenario = scenariosMap.get(scenarioID);
    if (!scenario) {
      scenario = {
        id: scenarioID,
        name: scenarioName,
        categories: [],
      };
      scenariosMap.set(scenarioID, scenario);
    } else {
      // If scenario with same ID but different name is found (e.g. from multiple rows), prefer non-default names.
      if (scenario.name === 'Imported Scenario' && scenarioName !== 'Imported Scenario') {
        scenario.name = scenarioName;
      }
    }

    const category: Category = {
      id: typeof row.CategoryID === 'string' ? row.CategoryID : uuidv4(),
      name: typeof row.CategoryName === 'string' ? row.CategoryName : 'Imported Category',
      description: typeof row.Description === 'string' ? row.Description : '',
      currentValue: Number(row.CurrentValue) || 0,
      maxValue: Number(row.MaxValue) || 0,
      icon: (typeof row.Icon === 'string' && row.Icon) ? row.Icon : DEFAULT_CATEGORY_ICON,
      isActive: stringToBoolean(row.IsActive),
      isPredefined: stringToBoolean(row.IsPredefined),
      type: (row.Type === 'income' || row.Type === 'expenditure') ? row.Type : 'expenditure',
    };
    
    // Ensure currentValue does not exceed maxValue
    if (category.currentValue > category.maxValue) {
        category.currentValue = category.maxValue;
    }

    scenario.categories.push(category);
  });

  return Array.from(scenariosMap.values());
}
