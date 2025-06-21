
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
import { PlusSquare, Edit, Trash2, FileCog } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ScenarioControlsProps {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onSwitchScenario: (scenarioId: string) => void;
  onCreateScenario: () => void;
  onRenameScenario: () => void;
  onDeleteScenario: (scenarioId: string) => void;
}

const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  scenarios,
  activeScenarioId,
  onSwitchScenario,
  onCreateScenario,
  onRenameScenario,
  onDeleteScenario,
}) => {
  if (!activeScenarioId) return null;

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={onSwitchScenario} value={activeScenarioId}>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ScenarioControls;
