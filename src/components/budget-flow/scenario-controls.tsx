
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
import { PlusSquare, Edit, Trash2 } from 'lucide-react';
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
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Select scenario..." />
        </SelectTrigger>
        <SelectContent>
          {scenarios.map(scenario => (
            <SelectItem key={scenario.id} value={scenario.id} className="text-xs">
              {scenario.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 px-3 text-xs">
            Scenario Manager
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCreateScenario} className="text-xs">
            <PlusSquare className="mr-2 h-3 w-3" />
            New Scenario
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRenameScenario} className="text-xs">
            <Edit className="mr-2 h-3 w-3" />
            Rename Current
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDeleteScenario(activeScenarioId)}
            className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
            disabled={scenarios.length <= 1}
          >
            <Trash2 className="mr-2 h-3 w-3" />
            Delete Current
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ScenarioControls;
