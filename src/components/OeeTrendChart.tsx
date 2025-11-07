import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { LineChart as LineChartIcon } from "lucide-react";

interface DailyOeeData {
  calendar_date: string;
  availability_avg: number;
  performance_avg: number;
  quality_avg: number;
  oee_avg: number;
  total_units_sum: number;
  defective_units_sum: number;
  expected_units?: number;
}

interface OeeTrendChartProps {
  data: DailyOeeData[];
  previousData?: DailyOeeData[];
  isLoading: boolean;
  compareEnabled?: boolean;
}

interface MetricVisibility {
  oee: boolean;
  availability: boolean;
  performance: boolean;
  quality: boolean;
}

export function OeeTrendChart({ data, previousData = [], isLoading, compareEnabled = false }: OeeTrendChartProps) {
  const { t } = useTranslation();
  
  const [visibleMetrics, setVisibleMetrics] = useState<MetricVisibility>({
    oee: true,
    availability: true,
    performance: true,
    quality: true,
  });

  const toggleMetric = (metric: keyof MetricVisibility) => {
    setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };
  
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
        <p className="text-muted-foreground">{t("no_trend_data")}</p>
      </Card>
    );
  }

  // Transform data for chart (convert to percentages)
  const chartData = data.map((day, index) => {
    const baseData = {
      date: format(parseISO(day.calendar_date), "MMM dd"),
      fullDate: day.calendar_date,
      Availability: parseFloat((day.availability_avg * 100).toFixed(1)),
      Performance: parseFloat((day.performance_avg * 100).toFixed(1)),
      Quality: parseFloat((day.quality_avg * 100).toFixed(1)),
      OEE: parseFloat((day.oee_avg * 100).toFixed(1)),
    };

    // Add previous period data if comparison enabled
    if (compareEnabled && previousData[index]) {
      const prevDay = previousData[index];
      return {
        ...baseData,
        "Prev Availability": parseFloat((prevDay.availability_avg * 100).toFixed(1)),
        "Prev Performance": parseFloat((prevDay.performance_avg * 100).toFixed(1)),
        "Prev Quality": parseFloat((prevDay.quality_avg * 100).toFixed(1)),
        "Prev OEE": parseFloat((prevDay.oee_avg * 100).toFixed(1)),
      };
    }

    return baseData;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentData = payload.filter((p: any) => !p.name.startsWith("Prev"));
      const prevData = payload.filter((p: any) => p.name.startsWith("Prev"));
      
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.fullDate}</p>
          
          {currentData.map((entry: any, index: number) => {
            const metricName = entry.name;
            const prevEntry = prevData.find((p: any) => p.name === `Prev ${metricName}`);
            const delta = prevEntry ? entry.value - prevEntry.value : null;
            
            return (
              <div key={index} className="mb-1">
                <p className="text-sm font-medium" style={{ color: entry.color }}>
                  {metricName}: {entry.value}%
                </p>
                {delta !== null && (
                  <p className={`text-xs ml-2 ${delta >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {prevEntry.value}% → {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold mb-1">Análisis de tendencia OEE</h2>
            <p className="text-sm text-muted-foreground">
              {t("daily_metrics_subtitle")}
            </p>
          </div>
        </div>
        
        {/* Metric Selector */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={visibleMetrics.oee ? "default" : "outline"}
            onClick={() => toggleMetric('oee')}
            className="transition-all duration-300"
            style={visibleMetrics.oee ? { backgroundColor: 'hsl(142, 76%, 36%)', borderColor: 'hsl(142, 76%, 36%)' } : {}}
          >
            OEE
          </Button>
          <Button
            size="sm"
            variant={visibleMetrics.availability ? "default" : "outline"}
            onClick={() => toggleMetric('availability')}
            className="transition-all duration-300"
            style={visibleMetrics.availability ? { backgroundColor: 'hsl(217, 91%, 60%)', borderColor: 'hsl(217, 91%, 60%)' } : {}}
          >
            Disponibilidad
          </Button>
          <Button
            size="sm"
            variant={visibleMetrics.performance ? "default" : "outline"}
            onClick={() => toggleMetric('performance')}
            className="transition-all duration-300"
            style={visibleMetrics.performance ? { backgroundColor: 'hsl(271, 81%, 56%)', borderColor: 'hsl(271, 81%, 56%)' } : {}}
          >
            Rendimiento
          </Button>
          <Button
            size="sm"
            variant={visibleMetrics.quality ? "default" : "outline"}
            onClick={() => toggleMetric('quality')}
            className="transition-all duration-300"
            style={visibleMetrics.quality ? { backgroundColor: 'hsl(158, 64%, 52%)', borderColor: 'hsl(158, 64%, 52%)' } : {}}
          >
            Calidad
          </Button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "14px" }}
            iconType="line"
            formatter={(value) => {
              if (value.startsWith("Prev ")) {
                return `${value.replace("Prev ", "")} (Período anterior)`;
              }
              return value;
            }}
          />
          
          {/* Current Period Lines */}
          {visibleMetrics.oee && (
            <Line
              type="monotone"
              dataKey="OEE"
              stroke="#27ae60"
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              className="transition-opacity duration-300"
            />
          )}
          {visibleMetrics.availability && (
            <Line
              type="monotone"
              dataKey="Availability"
              stroke="#3498db"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              strokeDasharray="5 5"
              className="transition-opacity duration-300"
            />
          )}
          {visibleMetrics.performance && (
            <Line
              type="monotone"
              dataKey="Performance"
              stroke="#9b59b6"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              strokeDasharray="5 5"
              className="transition-opacity duration-300"
            />
          )}
          {visibleMetrics.quality && (
            <Line
              type="monotone"
              dataKey="Quality"
              stroke="#2ecc71"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              strokeDasharray="5 5"
              className="transition-opacity duration-300"
            />
          )}
          
          {/* Previous Period Lines */}
          {compareEnabled && (
            <>
              {visibleMetrics.oee && (
                <Line
                  type="monotone"
                  dataKey="Prev OEE"
                  stroke="rgba(34, 197, 94, 0.4)"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  strokeDasharray="2 2"
                  className="transition-opacity duration-300"
                />
              )}
              {visibleMetrics.availability && (
                <Line
                  type="monotone"
                  dataKey="Prev Availability"
                  stroke="rgba(59, 130, 246, 0.4)"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  strokeDasharray="2 2"
                  className="transition-opacity duration-300"
                />
              )}
              {visibleMetrics.performance && (
                <Line
                  type="monotone"
                  dataKey="Prev Performance"
                  stroke="rgba(168, 85, 247, 0.4)"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  strokeDasharray="2 2"
                  className="transition-opacity duration-300"
                />
              )}
              {visibleMetrics.quality && (
                <Line
                  type="monotone"
                  dataKey="Prev Quality"
                  stroke="rgba(16, 185, 129, 0.4)"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  strokeDasharray="2 2"
                  className="transition-opacity duration-300"
                />
              )}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Band Reference */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-2">{t("oee_bands")}</p>
        <div className="flex flex-wrap gap-4">
          {[
            { labelKey: "excellence" as const, color: "#27ae60", range: "≥95%" },
            { labelKey: "good" as const, color: "#2ecc71", range: "≥85% <95%" },
            { labelKey: "acceptable" as const, color: "#3498db", range: "≥75% <85%" },
            { labelKey: "fair" as const, color: "#f39c12", range: "≥65% <75%" },
            { labelKey: "unacceptable" as const, color: "#e74c3c", range: "<65%" },
          ].map((band) => (
            <div key={band.labelKey} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: band.color }}
              />
              <span className="text-xs text-muted-foreground">
                {t(band.labelKey)} ({band.range})
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
