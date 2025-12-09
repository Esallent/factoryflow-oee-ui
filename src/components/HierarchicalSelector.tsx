import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Factory, Workflow, Wrench, Clock } from 'lucide-react';
import type { Plant, Line, Equipment, Shift } from '@/types/oee';

interface HierarchicalSelectorProps {
  // Values
  plantId?: string;
  lineId?: string;
  equipmentId?: string;
  shiftId?: string;
  
  // Change handlers
  onPlantChange: (value: string) => void;
  onLineChange: (value: string) => void;
  onEquipmentChange: (value: string) => void;
  onShiftChange: (value: string) => void;
  
  // Data
  plants: Plant[];
  lines: Line[];
  equipment: Equipment[];
  shifts: Shift[];
  
  // Loading states
  isLoadingPlants?: boolean;
  isLoadingLines?: boolean;
  isLoadingEquipment?: boolean;
  isLoadingShifts?: boolean;
  
  // Optional: show "all" options
  showAllOptions?: boolean;
  
  // Layout
  layout?: 'horizontal' | 'vertical';
}

export function HierarchicalSelector({
  plantId,
  lineId,
  equipmentId,
  shiftId,
  onPlantChange,
  onLineChange,
  onEquipmentChange,
  onShiftChange,
  plants,
  lines,
  equipment,
  shifts,
  isLoadingPlants,
  isLoadingLines,
  isLoadingEquipment,
  isLoadingShifts,
  showAllOptions = true,
  layout = 'horizontal',
}: HierarchicalSelectorProps) {
  const containerClass = layout === 'horizontal' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' 
    : 'space-y-4';

  return (
    <div className={containerClass}>
      {/* Plant Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Factory className="h-4 w-4 text-muted-foreground" />
          Planta
        </Label>
        {isLoadingPlants ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={plantId || ''} onValueChange={onPlantChange}>
            <SelectTrigger className="bg-sidebar border-border">
              <SelectValue placeholder="Seleccionar planta" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {showAllOptions && (
                <SelectItem value="all">Todas las Plantas</SelectItem>
              )}
              {plants.map((plant) => (
                <SelectItem key={plant.id} value={plant.id}>
                  {plant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Line Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-muted-foreground" />
          Línea
        </Label>
        {isLoadingLines ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select 
            value={lineId || ''} 
            onValueChange={onLineChange}
            disabled={!plantId || plantId === 'all'}
          >
            <SelectTrigger className="bg-sidebar border-border">
              <SelectValue placeholder="Seleccionar línea" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {showAllOptions && (
                <SelectItem value="all">Todas las Líneas</SelectItem>
              )}
              {lines.map((line) => (
                <SelectItem key={line.id} value={line.id}>
                  {line.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Equipment Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          Equipo
        </Label>
        {isLoadingEquipment ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select 
            value={equipmentId || ''} 
            onValueChange={onEquipmentChange}
            disabled={!lineId || lineId === 'all'}
          >
            <SelectTrigger className="bg-sidebar border-border">
              <SelectValue placeholder="Seleccionar equipo" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {showAllOptions && (
                <SelectItem value="all">Todos los Equipos</SelectItem>
              )}
              {equipment.map((eq) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Shift Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Turno
        </Label>
        {isLoadingShifts ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={shiftId || ''} onValueChange={onShiftChange}>
            <SelectTrigger className="bg-sidebar border-border">
              <SelectValue placeholder="Seleccionar turno" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {showAllOptions && (
                <SelectItem value="all">Todos los Turnos</SelectItem>
              )}
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name} ({shift.start_time} - {shift.end_time})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
