import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Puzzle } from 'lucide-react';

interface WeightedOeeBadgeProps {
  oee: number;
  toMin: number;
  weightedOee?: number;
  showDetails?: boolean;
}

export function WeightedOeeBadge({ oee, toMin, weightedOee, showDetails = true }: WeightedOeeBadgeProps) {
  const calculatedWeighted = weightedOee ?? oee * toMin;
  const oeePercent = (oee * 100).toFixed(1);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="bg-primary/10 border-primary/30 text-xs gap-1 cursor-help">
          <Puzzle className="h-3 w-3 text-primary" />
          <span className="text-primary font-medium">{oeePercent}%</span>
          <span className="text-muted-foreground">🧩</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-2">
          <p className="font-semibold">OEE Ponderado</p>
          <div className="text-sm space-y-1">
            <p>OEE: {oeePercent}%</p>
            <p>Tiempo Operativo (TO): {toMin.toFixed(0)} min</p>
            {showDetails && (
              <p className="text-muted-foreground">
                Ponderación: OEE × TO = {calculatedWeighted.toFixed(1)}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            El OEE ponderado considera el tiempo operativo para dar mayor peso a equipos con más producción.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
