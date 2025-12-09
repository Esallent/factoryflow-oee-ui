import React from "react";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, CheckCircle2, Target, Package, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/contexts/LanguageContext";

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

interface OeeDashboardKPIsProps {
  data: DailyOeeData[];
  previousData?: DailyOeeData[];
  isLoading: boolean;
  compareEnabled?: boolean;
}

const getOeeBandColor = (oee: number): string => {
  if (oee >= 0.95) return "#27ae60"; // Excelente
  if (oee >= 0.85) return "#2ecc71"; // Bueno
  if (oee >= 0.75) return "#3498db"; // Aceptable
  if (oee >= 0.65) return "#f39c12"; // Regular
  return "#e74c3c"; // Inaceptable
};

const getOeeBandText = (oee: number, t: (key: string) => string): string => {
  if (oee >= 0.95) return t("excellence");
  if (oee >= 0.85) return t("good");
  if (oee >= 0.75) return t("acceptable");
  if (oee >= 0.65) return t("fair");
  return t("unacceptable");
};

export function OeeDashboardKPIs({ data, previousData = [], isLoading, compareEnabled = false }: OeeDashboardKPIsProps) {
  const { t } = useTranslation();
  
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
        <p className="text-muted-foreground">{t("no_data_selected_filters")}</p>
      </Card>
    );
  }

  // Calculate weighted OEE: OEE_ponderado = Σ(OEE × TO) / Σ(TO)
  // TO (Tiempo Operativo) = TF × Availability
  const totals = data.reduce(
    (acc, day) => {
      const tf = day.available_time_min || 480; // Default 8h shift
      const to = tf * day.availability_avg; // Tiempo Operativo
      
      return {
        availability_weighted: acc.availability_weighted + (day.availability_avg * tf),
        performance_weighted: acc.performance_weighted + (day.performance_avg * to),
        quality_weighted: acc.quality_weighted + (day.quality_avg * to),
        oee_weighted: acc.oee_weighted + (day.oee_avg * to),
        total_tf: acc.total_tf + tf,
        total_to: acc.total_to + to,
        units: acc.units + day.total_units_sum,
        defective: acc.defective + day.defective_units_sum,
        expected: acc.expected + (day.expected_units || 0),
      };
    },
    { availability_weighted: 0, performance_weighted: 0, quality_weighted: 0, oee_weighted: 0, total_tf: 0, total_to: 0, units: 0, defective: 0, expected: 0 }
  );

  // Weighted averages: metric = Σ(metric × TO) / Σ(TO)
  const avgAvailability = totals.total_tf > 0 ? (totals.availability_weighted / totals.total_tf) * 100 : 0;
  const avgPerformance = totals.total_to > 0 ? (totals.performance_weighted / totals.total_to) * 100 : 0;
  const avgQuality = totals.total_to > 0 ? (totals.quality_weighted / totals.total_to) * 100 : 0;
  const avgOee = totals.total_to > 0 ? (totals.oee_weighted / totals.total_to) * 100 : 0;
  const totalUnits = totals.units;
  const totalDefective = totals.defective;
  const totalExpected = totals.expected;

  // Calculate previous period metrics if comparison enabled (also weighted)
  let prevAvgAvailability = 0, prevAvgPerformance = 0, prevAvgQuality = 0, prevAvgOee = 0;
  let prevTotalUnits = 0, prevTotalDefective = 0, prevTotalExpected = 0;

  if (compareEnabled && previousData.length > 0) {
    const prevTotals = previousData.reduce(
      (acc, day) => {
        const tf = day.available_time_min || 480;
        const to = tf * day.availability_avg;
        
        return {
          availability_weighted: acc.availability_weighted + (day.availability_avg * tf),
          performance_weighted: acc.performance_weighted + (day.performance_avg * to),
          quality_weighted: acc.quality_weighted + (day.quality_avg * to),
          oee_weighted: acc.oee_weighted + (day.oee_avg * to),
          total_tf: acc.total_tf + tf,
          total_to: acc.total_to + to,
          units: acc.units + day.total_units_sum,
          defective: acc.defective + day.defective_units_sum,
          expected: acc.expected + (day.expected_units || 0),
        };
      },
      { availability_weighted: 0, performance_weighted: 0, quality_weighted: 0, oee_weighted: 0, total_tf: 0, total_to: 0, units: 0, defective: 0, expected: 0 }
    );

    prevAvgAvailability = prevTotals.total_tf > 0 ? (prevTotals.availability_weighted / prevTotals.total_tf) * 100 : 0;
    prevAvgPerformance = prevTotals.total_to > 0 ? (prevTotals.performance_weighted / prevTotals.total_to) * 100 : 0;
    prevAvgQuality = prevTotals.total_to > 0 ? (prevTotals.quality_weighted / prevTotals.total_to) * 100 : 0;
    prevAvgOee = prevTotals.total_to > 0 ? (prevTotals.oee_weighted / prevTotals.total_to) * 100 : 0;
    prevTotalUnits = prevTotals.units;
    prevTotalDefective = prevTotals.defective;
    prevTotalExpected = prevTotals.expected;
  }

  const calculateDelta = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const oeeBandColor = getOeeBandColor(avgOee / 100);
  const oeeBandText = getOeeBandText(avgOee / 100, t);

  const kpiData = [
    {
      label: t("availability_label"),
      value: avgAvailability.toFixed(1) + "%",
      prevValue: compareEnabled ? prevAvgAvailability.toFixed(1) + "%" : null,
      delta: compareEnabled ? calculateDelta(avgAvailability, prevAvgAvailability) : null,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      label: t("performance_label"),
      value: avgPerformance.toFixed(1) + "%",
      prevValue: compareEnabled ? prevAvgPerformance.toFixed(1) + "%" : null,
      delta: compareEnabled ? calculateDelta(avgPerformance, prevAvgPerformance) : null,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
    {
      label: t("quality_label"),
      value: avgQuality.toFixed(1) + "%",
      prevValue: compareEnabled ? prevAvgQuality.toFixed(1) + "%" : null,
      delta: compareEnabled ? calculateDelta(avgQuality, prevAvgQuality) : null,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      label: t("overall_oee_label"),
      value: avgOee.toFixed(1) + "%",
      prevValue: compareEnabled ? prevAvgOee.toFixed(1) + "%" : null,
      delta: compareEnabled ? calculateDelta(avgOee, prevAvgOee) : null,
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
                  <div className="flex items-baseline gap-2">
                    <p
                      className="text-3xl font-bold"
                      style={kpi.highlight ? { color: kpi.color } : {}}
                    >
                      {kpi.value}
                    </p>
                    {kpi.prevValue && (
                      <p className="text-sm text-muted-foreground">
                        / {kpi.prevValue}
                      </p>
                    )}
                  </div>
                  {kpi.delta !== null && (
                    <p className={`text-xs font-medium mt-1 ${kpi.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {kpi.delta >= 0 ? '▲' : '▼'} {Math.abs(kpi.delta).toFixed(1)}%
                    </p>
                  )}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t("total_units_produced")}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{totalUnits.toLocaleString()}</p>
                {compareEnabled && prevTotalUnits > 0 && (
                  <p className="text-sm text-muted-foreground">/ {prevTotalUnits.toLocaleString()}</p>
                )}
              </div>
              {compareEnabled && prevTotalUnits > 0 && (
                <p className={`text-xs font-medium ${calculateDelta(totalUnits, prevTotalUnits) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {calculateDelta(totalUnits, prevTotalUnits) >= 0 ? '▲' : '▼'} {Math.abs(calculateDelta(totalUnits, prevTotalUnits)).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-500/10">
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t("expected_units_label")}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{totalExpected.toLocaleString()}</p>
                {compareEnabled && prevTotalExpected > 0 && (
                  <p className="text-sm text-muted-foreground">/ {prevTotalExpected.toLocaleString()}</p>
                )}
              </div>
              {totalExpected > 0 && (
                <p className="text-xs text-muted-foreground">
                  {((totalUnits / totalExpected) * 100).toFixed(1)}% {t("completion")}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t("total_defective_units_label")}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{totalDefective.toLocaleString()}</p>
                {compareEnabled && prevTotalDefective > 0 && (
                  <p className="text-sm text-muted-foreground">/ {prevTotalDefective.toLocaleString()}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {((totalDefective / totalUnits) * 100).toFixed(2)}% {t("defect_rate")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
