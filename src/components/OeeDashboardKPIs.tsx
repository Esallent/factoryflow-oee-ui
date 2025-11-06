import React from "react";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, CheckCircle2, Target, Package, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyOeeData {
  calendar_date: string;
  availability_avg: number;
  performance_avg: number;
  quality_avg: number;
  oee_avg: number;
  total_units_sum: number;
  defective_units_sum: number;
}

interface OeeDashboardKPIsProps {
  data: DailyOeeData[];
  isLoading: boolean;
}

const getOeeBandColor = (oee: number): string => {
  if (oee >= 0.85) return "#27ae60"; // Excellence
  if (oee >= 0.75) return "#2ecc71"; // Good
  if (oee >= 0.60) return "#f1c40f"; // Acceptable
  if (oee >= 0.40) return "#f39c12"; // Fair
  return "#e74c3c"; // Unacceptable
};

const getOeeBandText = (oee: number): string => {
  if (oee >= 0.85) return "Excellence";
  if (oee >= 0.75) return "Good";
  if (oee >= 0.60) return "Acceptable";
  if (oee >= 0.40) return "Fair";
  return "Unacceptable";
};

export function OeeDashboardKPIs({ data, isLoading }: OeeDashboardKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 bg-card border-border">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <p className="text-muted-foreground">No data available for the selected filters</p>
      </Card>
    );
  }

  // Calculate averages across all days
  const totals = data.reduce(
    (acc, day) => ({
      availability: acc.availability + day.availability_avg,
      performance: acc.performance + day.performance_avg,
      quality: acc.quality + day.quality_avg,
      oee: acc.oee + day.oee_avg,
      units: acc.units + day.total_units_sum,
      defective: acc.defective + day.defective_units_sum,
    }),
    { availability: 0, performance: 0, quality: 0, oee: 0, units: 0, defective: 0 }
  );

  const count = data.length;
  const avgAvailability = (totals.availability / count) * 100;
  const avgPerformance = (totals.performance / count) * 100;
  const avgQuality = (totals.quality / count) * 100;
  const avgOee = (totals.oee / count) * 100;
  const totalUnits = totals.units;
  const totalDefective = totals.defective;

  const oeeBandColor = getOeeBandColor(avgOee / 100);
  const oeeBandText = getOeeBandText(avgOee / 100);

  const kpiData = [
    {
      label: "Availability",
      value: avgAvailability.toFixed(1) + "%",
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      label: "Performance",
      value: avgPerformance.toFixed(1) + "%",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
    {
      label: "Quality",
      value: avgQuality.toFixed(1) + "%",
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      label: "Overall OEE",
      value: avgOee.toFixed(1) + "%",
      subtitle: oeeBandText,
      icon: Target,
      color: oeeBandColor,
      bgColor: `${oeeBandColor}15`,
      borderColor: oeeBandColor,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className={`p-6 bg-card border-2 transition-all hover:shadow-lg ${
                kpi.highlight ? "" : "border-border"
              }`}
              style={kpi.highlight ? { borderColor: kpi.borderColor } : {}}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                  <p
                    className="text-3xl font-bold"
                    style={kpi.highlight ? { color: kpi.color } : {}}
                  >
                    {kpi.value}
                  </p>
                  {kpi.subtitle && (
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mt-2 px-2 py-1 rounded-full inline-block"
                      style={{
                        backgroundColor: `${kpi.color}30`,
                        color: kpi.color,
                      }}
                    >
                      {kpi.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} style={kpi.highlight ? { color: kpi.color } : {}} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Units Produced</p>
              <p className="text-2xl font-bold">{totalUnits.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Defective Units</p>
              <p className="text-2xl font-bold">{totalDefective.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {((totalDefective / totalUnits) * 100).toFixed(2)}% defect rate
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
