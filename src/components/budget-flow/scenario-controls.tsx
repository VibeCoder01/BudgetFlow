
"use client";

import React from 'react';
import type { Scenario } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { PlusSquare, Edit, Trash2, FileCog, Download, Upload, FileText, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface ScenarioControlsProps {
  activeScenarioId: string | null;
  onCreateScenario: () => void;
  onRenameScenario: () => void;
  onDeleteScenario: (scenarioId: string) => void;
  onExportData: (format: 'csv' | 'xlsx') => void;
  onImportRequest: () => void;
}

const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  activeScenarioId,
  onCreateScenario,
  onRenameScenario,
  onDeleteScenario,
  onExportData,
  onImportRequest,
}) => {
  if (!activeScenarioId) return null;

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm">
            <FileCog className="mr-2 h-4 w-4" />
            Scenario Manager
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCreateScenario}>
            <PlusSquare className="mr-2 h-4 w-4" />
            New Scenario
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRenameScenario}>
            <Edit className="mr-2 h-4 w-4" />
            Rename Current
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDeleteScenario(activeScenarioId)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Current
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Download className="mr-2 h-4 w-4" />
              <span>Export All Scenarios</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onExportData('csv')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportData('xlsx')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as XLSX
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={onImportRequest}>
            <Upload className="mr-2 h-4 w-4" />
            Import Scenarios
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
};

export default ScenarioControls;
