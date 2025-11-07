import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

interface DailyOeeData {
  calendar_date: string;
  availability_avg: number;
  performance_avg: number;
  quality_avg: number;
  oee_avg: number;
  total_units_sum: number;
  defective_units_sum: number;
  expected_units?: number;
  available_time_min?: number;
  cycle_time_min?: number;
}

interface OeeWaterfallChartProps {
  data: DailyOeeData[];
  isLoading: boolean;
}

export function OeeWaterfallChart({ data, isLoading }: OeeWaterfallChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <Skeleton className="h-[500px] w-full" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <p className="text-muted-foreground">No hay datos disponibles para el análisis de cascada</p>
      </Card>
    );
  }

  // Calculate average metrics from daily data
  const avgAvailability = data.reduce((sum, d) => sum + d.availability_avg, 0) / data.length;
  const avgPerformance = data.reduce((sum, d) => sum + d.performance_avg, 0) / data.length;
  const avgQuality = data.reduce((sum, d) => sum + d.quality_avg, 0) / data.length;
  const avgOee = data.reduce((sum, d) => sum + d.oee_avg, 0) / data.length;

  // Use 480 minutes (8 hours) as base time for demonstration
  const TF = 480; // Tiempo de Turno (total available time)
  
  // Calculate time hierarchy
  const plannedDowntime = TF * (1 - avgAvailability) * 0.3; // Assume 30% of unavailability is planned
  const TP = TF - plannedDowntime; // Tiempo Planificado
  
  const unplannedDowntime = TF * (1 - avgAvailability) * 0.7; // 70% is unplanned
  const TO = TP - unplannedDowntime; // Tiempo de Funcionamiento
  
  const performanceLoss = TO * (1 - avgPerformance);
  const TNO = TO - performanceLoss; // Tiempo Neto Operativo
  
  const qualityLoss = TNO * (1 - avgQuality);
  const TNV = TNO - qualityLoss; // Tiempo de Valor Neto (OEE result)

  // Build waterfall data with stacked structure
  const waterfallData = [
    {
      name: "Tiempo de Turno",
      shortName: "TF",
      timeValue: TF,
      lossValue: 0,
      fill: "#3B82F6",
      lossColor: "#3B82F6",
      description: "Tiempo total disponible en el turno",
      lossDescription: ""
    },
    {
      name: "Tiempo Planificado",
      shortName: "TP",
      timeValue: TP,
      lossValue: plannedDowntime,
      fill: "#64748B",
      lossColor: "#94A3B8",
      description: "Tiempo planificado después de paradas",
      lossDescription: "Paradas planificadas"
    },
    {
      name: "Tiempo de Funcionamiento",
      shortName: "TO",
      timeValue: TO,
      lossValue: unplannedDowntime,
      fill: "#EF4444",
      lossColor: "#F87171",
      description: "Tiempo de funcionamiento efectivo",
      lossDescription: "Paradas no planificadas"
    },
    {
      name: "Tiempo Neto Operativo",
      shortName: "TNO",
      timeValue: TNO,
      lossValue: performanceLoss,
      fill: "#F59E0B",
      lossColor: "#FBBF24",
      description: "Tiempo operativo neto",
      lossDescription: "Pérdidas de rendimiento"
    },
    {
      name: "Tiempo de Valor Neto",
      shortName: "TNV",
      timeValue: TNV,
      lossValue: qualityLoss,
      fill: "#10B981",
      lossColor: "#34D399",
      description: "Tiempo de valor neto (OEE)",
      lossDescription: "Pérdidas de calidad"
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const lossPercent = data.lossValue > 0 ? ((data.lossValue / TF) * 100).toFixed(1) : 0;
      const valuePercent = ((data.timeValue / TF) * 100).toFixed(1);
      
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-2">{data.name} ({data.shortName})</p>
          <p className="text-sm text-muted-foreground mb-2">{data.description}</p>
          <p className="text-sm">
            <span className="font-medium">Duración:</span> {data.timeValue.toFixed(1)} min ({valuePercent}%)
          </p>
          {data.lossValue > 0 && (
            <p className="text-sm text-destructive mt-1">
              <span className="font-medium">{data.lossDescription}:</span> -{data.lossValue.toFixed(1)} min (-{lossPercent}%)
            </p>
          )}
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
          <h2 className="text-xl font-semibold">Cascada de pérdidas OEE — Composición de tiempos productivos</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Visualización jerárquica de tiempos TF → TNV, con pérdidas apiladas sobre cada nivel
        </p>
      </div>

      <ResponsiveContainer width="100%" height={450}>
        <BarChart
          data={waterfallData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            angle={-45}
            textAnchor="end"
            height={100}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Stacked bars: time value + loss value */}
          <Bar dataKey="timeValue" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} isAnimationActive={true}>
            {waterfallData.map((entry, index) => (
              <Cell key={`time-${index}`} fill={entry.fill} />
            ))}
          </Bar>
          
          <Bar dataKey="lossValue" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} isAnimationActive={true}>
            {waterfallData.map((entry, index) => (
              <Cell 
                key={`loss-${index}`} 
                fill={entry.lossColor}
                opacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend and Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Hierarchy Legend */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">Jerarquía de Tiempos</p>
            <div className="space-y-2">
              {waterfallData.map((item) => (
                <div key={item.shortName} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name} ({item.shortName})</span>
                      <span className="text-sm text-muted-foreground">
                        {item.timeValue.toFixed(1)} min ({((item.timeValue / TF) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {item.lossValue > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Pérdidas: {item.lossValue.toFixed(1)} min
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OEE Metrics Summary */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">Resumen de Métricas OEE</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Disponibilidad</span>
                <span className="text-sm font-semibold text-primary">
                  {(avgAvailability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rendimiento</span>
                <span className="text-sm font-semibold text-primary">
                  {(avgPerformance * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Calidad</span>
                <span className="text-sm font-semibold text-primary">
                  {(avgQuality * 100).toFixed(1)}%
                </span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="text-sm font-semibold">OEE General</span>
                <span className="text-lg font-bold text-success">
                  {(avgOee * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
