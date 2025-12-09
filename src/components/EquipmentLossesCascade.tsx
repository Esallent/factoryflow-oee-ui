import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Layers, AlertTriangle } from 'lucide-react';
import type { EquipmentLossesData } from '@/types/oee';

interface EquipmentLossesCascadeProps {
  data: EquipmentLossesData | null;
  isLoading: boolean;
  showPercentages?: boolean;
}

const LOSS_COLORS = {
  planned: { main: 'hsl(215, 15%, 45%)', label: 'Paradas Planificadas' },
  unplanned: { main: 'hsl(0, 72%, 51%)', label: 'Paradas No Planificadas' },
  performance: { main: 'hsl(38, 92%, 50%)', label: 'Pérdidas de Rendimiento' },
  quality: { main: 'hsl(271, 81%, 56%)', label: 'Pérdidas de Calidad' },
  productive: { main: 'hsl(142, 76%, 36%)', label: 'Tiempo Productivo (TNV)' },
};

export function EquipmentLossesCascade({ data, isLoading, showPercentages = true }: EquipmentLossesCascadeProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <Skeleton className="h-[450px] w-full" />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">Seleccione un equipo para ver la cascada de pérdidas</p>
        </div>
      </Card>
    );
  }

  // Build waterfall data structure
  const waterfallData = [
    {
      name: 'TF',
      fullName: 'Tiempo de Turno',
      value: data.tf_min,
      pct: 100,
      fill: 'hsl(217, 91%, 60%)',
      cumulative: data.tf_min,
    },
    {
      name: 'Planificadas',
      fullName: 'Paradas Planificadas',
      value: -data.planned_loss_min,
      pct: data.planned_loss_pct,
      fill: LOSS_COLORS.planned.main,
      cumulative: data.tf_min - data.planned_loss_min,
      isLoss: true,
    },
    {
      name: 'TP',
      fullName: 'Tiempo Planificado',
      value: data.tf_min - data.planned_loss_min,
      pct: ((data.tf_min - data.planned_loss_min) / data.tf_min) * 100,
      fill: 'hsl(215, 20%, 50%)',
      cumulative: data.tf_min - data.planned_loss_min,
    },
    {
      name: 'No Plan.',
      fullName: 'Paradas No Planificadas',
      value: -data.unplanned_loss_min,
      pct: data.unplanned_loss_pct,
      fill: LOSS_COLORS.unplanned.main,
      cumulative: data.tf_min - data.planned_loss_min - data.unplanned_loss_min,
      isLoss: true,
    },
    {
      name: 'TO',
      fullName: 'Tiempo Operativo',
      value: data.tf_min - data.planned_loss_min - data.unplanned_loss_min,
      pct: ((data.tf_min - data.planned_loss_min - data.unplanned_loss_min) / data.tf_min) * 100,
      fill: 'hsl(199, 89%, 48%)',
      cumulative: data.tf_min - data.planned_loss_min - data.unplanned_loss_min,
    },
    {
      name: 'Rendim.',
      fullName: 'Pérdidas de Rendimiento',
      value: -data.performance_loss_min,
      pct: data.performance_loss_pct,
      fill: LOSS_COLORS.performance.main,
      cumulative: data.tf_min - data.planned_loss_min - data.unplanned_loss_min - data.performance_loss_min,
      isLoss: true,
    },
    {
      name: 'TNO',
      fullName: 'Tiempo Neto Operativo',
      value: data.tf_min - data.planned_loss_min - data.unplanned_loss_min - data.performance_loss_min,
      pct: ((data.tf_min - data.planned_loss_min - data.unplanned_loss_min - data.performance_loss_min) / data.tf_min) * 100,
      fill: 'hsl(158, 64%, 52%)',
      cumulative: data.tf_min - data.planned_loss_min - data.unplanned_loss_min - data.performance_loss_min,
    },
    {
      name: 'Calidad',
      fullName: 'Pérdidas de Calidad',
      value: -data.quality_loss_min,
      pct: data.quality_loss_pct,
      fill: LOSS_COLORS.quality.main,
      cumulative: data.tnv_min,
      isLoss: true,
    },
    {
      name: 'TNV',
      fullName: 'Tiempo de Valor Neto',
      value: data.tnv_min,
      pct: data.tnv_pct,
      fill: LOSS_COLORS.productive.main,
      cumulative: data.tnv_min,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const absValue = Math.abs(item.value);
      
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-2">{item.fullName}</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Duración:</span>{' '}
              <span className={item.isLoss ? 'text-destructive' : ''}>
                {item.isLoss ? '-' : ''}{absValue.toFixed(1)} min
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">% del TF:</span>{' '}
              <span>{item.pct.toFixed(1)}%</span>
            </p>
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
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Cascada de Pérdidas — {data.equipment_name}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Desglose jerárquico TF → TNV • {data.record_date}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(value) => `${Math.abs(value)} min`}
            label={{ value: 'Minutos', angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Bar dataKey="cumulative" radius={[4, 4, 0, 0]}>
            {waterfallData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} opacity={entry.isLoss ? 0.8 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Planificadas</p>
            <p className="text-lg font-bold" style={{ color: LOSS_COLORS.planned.main }}>
              {data.planned_loss_pct.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{data.planned_loss_min.toFixed(0)} min</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">No Planificadas</p>
            <p className="text-lg font-bold" style={{ color: LOSS_COLORS.unplanned.main }}>
              {data.unplanned_loss_pct.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{data.unplanned_loss_min.toFixed(0)} min</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Rendimiento</p>
            <p className="text-lg font-bold" style={{ color: LOSS_COLORS.performance.main }}>
              {data.performance_loss_pct.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{data.performance_loss_min.toFixed(0)} min</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Calidad</p>
            <p className="text-lg font-bold" style={{ color: LOSS_COLORS.quality.main }}>
              {data.quality_loss_pct.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{data.quality_loss_min.toFixed(0)} min</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Productivo (TNV)</p>
            <p className="text-lg font-bold" style={{ color: LOSS_COLORS.productive.main }}>
              {data.tnv_pct.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{data.tnv_min.toFixed(0)} min</p>
          </div>
        </div>
      </div>

      {/* Loss Categories Breakdown */}
      {data.loss_categories && data.loss_categories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Detalle de Pérdidas</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.loss_categories.map((cat) => (
              <div 
                key={cat.code} 
                className="p-2 rounded-lg bg-muted/50 border border-border"
              >
                <p className="text-xs font-medium truncate">{cat.name}</p>
                <p className="text-sm font-bold">{cat.duration_min.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">{cat.pct_of_tf.toFixed(1)}% TF</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
