import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getOeeBandColor } from '@/types/oee';
import type { EquipmentComparisonData } from '@/types/oee';

interface EquipmentComparisonChartProps {
  data: EquipmentComparisonData[];
  isLoading: boolean;
  lineAvgOee?: number;
  onEquipmentClick?: (equipmentId: string) => void;
}

export function EquipmentComparisonChart({ 
  data, 
  isLoading, 
  lineAvgOee,
  onEquipmentClick 
}: EquipmentComparisonChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <p className="text-muted-foreground">Seleccione una línea para ver la comparativa de equipos</p>
      </Card>
    );
  }

  // Calculate line average if not provided
  const calculatedLineAvg = lineAvgOee ?? (data.reduce((sum, d) => sum + d.oee, 0) / data.length);

  // Sort by OEE descending for ranking
  const sortedData = [...data].sort((a, b) => b.oee - a.oee);

  // Transform data for horizontal bar chart
  const chartData = sortedData.map((item, index) => ({
    ...item,
    rank: index + 1,
    oeePercent: item.oee * 100,
    deltaPercent: item.oee_delta_vs_line_avg * 100,
    fill: getOeeBandColor(item.oee),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as typeof chartData[0];
      const deltaIcon = item.deltaPercent > 0 ? (
        <TrendingUp className="h-4 w-4 text-green-400 inline" />
      ) : item.deltaPercent < 0 ? (
        <TrendingDown className="h-4 w-4 text-red-400 inline" />
      ) : (
        <Minus className="h-4 w-4 text-muted-foreground inline" />
      );

      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="font-semibold mb-2">{item.equipment_name}</p>
          <p className="text-sm text-muted-foreground mb-2">Ranking: #{item.rank}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>OEE:</span>
              <span className="font-bold" style={{ color: item.fill }}>
                {item.oeePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>vs Promedio:</span>
              <span className={`font-medium ${item.deltaPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {deltaIcon} {item.deltaPercent >= 0 ? '+' : ''}{item.deltaPercent.toFixed(1)}%
              </span>
            </div>
            <div className="pt-2 border-t border-border space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disponibilidad:</span>
                <span>{(item.availability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rendimiento:</span>
                <span>{(item.performance * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calidad:</span>
                <span>{(item.quality * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Comparativa de Equipos por Línea</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Ranking de OEE por equipo • Promedio de línea: {(calculatedLineAvg * 100).toFixed(1)}%
        </p>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 50)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="equipment_name"
            stroke="hsl(var(--muted-foreground))"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference line for line average */}
          <ReferenceLine 
            x={calculatedLineAvg * 100} 
            stroke="hsl(var(--muted-foreground))" 
            strokeDasharray="5 5"
            label={{ 
              value: 'Promedio', 
              position: 'top',
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 11
            }}
          />
          
          <Bar 
            dataKey="oeePercent" 
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(data) => onEquipmentClick?.(data.equipment_id)}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* OEE Band Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Rangos OEE</p>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Excelente', color: getOeeBandColor(0.95), range: '≥95%' },
            { label: 'Bueno', color: getOeeBandColor(0.85), range: '≥85%' },
            { label: 'Aceptable', color: getOeeBandColor(0.75), range: '≥75%' },
            { label: 'Regular', color: getOeeBandColor(0.65), range: '≥65%' },
            { label: 'Inaceptable', color: getOeeBandColor(0.5), range: '<65%' },
          ].map((band) => (
            <div key={band.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: band.color }} />
              <span className="text-xs text-muted-foreground">{band.label} ({band.range})</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
