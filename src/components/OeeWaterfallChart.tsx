import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/contexts/LanguageContext";
import { Info } from "lucide-react";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { t } = useTranslation();

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
        <p className="text-muted-foreground">No hay datos para mostrar la cascada de pérdidas</p>
      </Card>
    );
  }

  // Calculate average metrics
  const totals = data.reduce(
    (acc, day) => ({
      availability: acc.availability + day.availability_avg,
      performance: acc.performance + day.performance_avg,
      quality: acc.quality + day.quality_avg,
      oee: acc.oee + day.oee_avg,
    }),
    { availability: 0, performance: 0, quality: 0, oee: 0 }
  );

  const count = data.length;
  const avgAvailability = totals.availability / count;
  const avgPerformance = totals.performance / count;
  const avgQuality = totals.quality / count;
  const avgOee = totals.oee / count;

  // Calculate losses (as % of TF)
  // TF = 100%
  // TP = TF - Planned Downtime
  // TO = TP - Unplanned Downtime (Availability Loss)
  // TNO = TO - Performance Loss
  // TNV = TNO - Quality Loss = OEE

  const TF = 100; // Total Available Time
  const plannedDowntimeLoss = 10; // Mock: ~10% planned downtime
  const TP = TF - plannedDowntimeLoss;

  const availabilityLoss = TP * (1 - avgAvailability);
  const TO = TP - availabilityLoss;

  const performanceLoss = TO * (1 - avgPerformance);
  const TNO = TO - performanceLoss;

  const qualityLoss = TNO * (1 - avgQuality);
  const TNV = TNO - qualityLoss; // This should equal avgOee * TP

  // Waterfall data structure
  // Start at TF, cascade down with losses, end at TNV (OEE)
  const waterfallData = [
    {
      name: "TF",
      label: "Tiempo Total (TF)",
      value: TF,
      displayValue: TF.toFixed(1),
      fill: "#3498db",
      type: "base",
      tooltip: "Tiempo total disponible para producción",
    },
    {
      name: "Planned Loss",
      label: "Paradas Planificadas",
      value: -plannedDowntimeLoss,
      displayValue: plannedDowntimeLoss.toFixed(1),
      fill: "#95a5a6",
      type: "loss",
      tooltip: "Tiempo perdido por paradas planificadas (mantenimiento, breaks)",
    },
    {
      name: "TP",
      label: "Tiempo Planificado (TP)",
      value: TP,
      displayValue: TP.toFixed(1),
      fill: "#3498db",
      type: "milestone",
      tooltip: "Tiempo disponible después de paradas planificadas",
    },
    {
      name: "Availability Loss",
      label: "Pérdida Disponibilidad",
      value: -availabilityLoss,
      displayValue: availabilityLoss.toFixed(1),
      fill: "#e74c3c",
      type: "loss",
      tooltip: "Tiempo perdido por paradas no planificadas (fallas, averías)",
    },
    {
      name: "TO",
      label: "Tiempo Operativo (TO)",
      value: TO,
      displayValue: TO.toFixed(1),
      fill: "#3498db",
      type: "milestone",
      tooltip: "Tiempo efectivo de operación después de todas las paradas",
    },
    {
      name: "Performance Loss",
      label: "Pérdida Rendimiento",
      value: -performanceLoss,
      displayValue: performanceLoss.toFixed(1),
      fill: "#f39c12",
      type: "loss",
      tooltip: "Tiempo perdido por velocidad reducida, microparadas",
    },
    {
      name: "TNO",
      label: "Tiempo Neto Operativo (TNO)",
      value: TNO,
      displayValue: TNO.toFixed(1),
      fill: "#3498db",
      type: "milestone",
      tooltip: "Tiempo operativo a velocidad ideal",
    },
    {
      name: "Quality Loss",
      label: "Pérdida Calidad",
      value: -qualityLoss,
      displayValue: qualityLoss.toFixed(1),
      fill: "#e67e22",
      type: "loss",
      tooltip: "Tiempo invertido en producir unidades defectuosas",
    },
    {
      name: "TNV",
      label: "Tiempo Neto Valioso (TNV = OEE)",
      value: TNV,
      displayValue: TNV.toFixed(1),
      fill: "#27ae60",
      type: "final",
      tooltip: "Tiempo efectivo produciendo unidades de calidad (OEE final)",
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-1">{data.label}</p>
          <p className="text-sm text-muted-foreground">{data.tooltip}</p>
          <p className="text-lg font-bold mt-2" style={{ color: data.fill }}>
            {Math.abs(parseFloat(data.displayValue))}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Cascada de Pérdidas OEE</h2>
          <p className="text-sm text-muted-foreground">
            Análisis jerárquico de tiempo: TF → TP → TO → TNO → TNV
          </p>
        </div>
        <TooltipProvider>
          <TooltipUI>
            <TooltipTrigger asChild>
              <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <Info className="h-5 w-5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs bg-popover border-border">
              <p className="text-xs">
                <strong>TF:</strong> Tiempo Total disponible<br />
                <strong>TP:</strong> TF - Paradas Planificadas<br />
                <strong>TO:</strong> TP - Pérdidas de Disponibilidad<br />
                <strong>TNO:</strong> TO - Pérdidas de Rendimiento<br />
                <strong>TNV (OEE):</strong> TNO - Pérdidas de Calidad
              </p>
            </TooltipContent>
          </TooltipUI>
        </TooltipProvider>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={waterfallData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "11px" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {waterfallData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend explaining loss types */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Tipos de pérdidas</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Paradas Planificadas", color: "#95a5a6", desc: "Mantenimiento, cambios, breaks" },
            { label: "Disponibilidad", color: "#e74c3c", desc: "Fallas, averías no planificadas" },
            { label: "Rendimiento", color: "#f39c12", desc: "Velocidad reducida, microparadas" },
            { label: "Calidad", color: "#e67e22", desc: "Unidades defectuosas, retrabajos" },
          ].map((loss) => (
            <div key={loss.label} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
              <div
                className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
                style={{ backgroundColor: loss.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{loss.label}</p>
                <p className="text-xs text-muted-foreground">{loss.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Resumen de eficiencia</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Disponibilidad</p>
            <p className="text-lg font-bold text-foreground">{(avgAvailability * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rendimiento</p>
            <p className="text-lg font-bold text-foreground">{(avgPerformance * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Calidad</p>
            <p className="text-lg font-bold text-foreground">{(avgQuality * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">OEE Total</p>
            <p className="text-lg font-bold text-status-good">{(avgOee * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
