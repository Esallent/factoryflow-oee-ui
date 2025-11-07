import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Activity, Gauge, CheckCircle, TrendingUp, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { demoDataset } from "@/data/demoDataset";
import { format, parseISO } from "date-fns";
import { useTranslation } from "@/contexts/LanguageContext";
import { EquipmentTechnicalData } from "@/components/EquipmentTechnicalData";

export default function DemoSpada() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  
  // Demo data for L.V. Spada
  const shiftData = {
    id_record: 2001,
    id_line: 2,
    id_equipment: 2,
    id_shift: 1,
    shift_started_at_tz: "2025-11-06T06:00:00-03:00",
    planned_time_min: 540,
    planned_downtime_min: 78,
    unplanned_downtime_min: 78.25,
    cycle_time_min: 0.36,
    total_units: 1104,
    defective_units: 15,
    available_time_min: 479.6,
    operating_time_min: 401,
    theoretical_output_units: 1483,
    availability_ratio: 0.809,
    performance_ratio: 0.919,
    quality_ratio: 0.986,
    oee_total: 0.733,
    oee_band_code: "acceptable",
    oee_band_es: "Aceptable",
    source: "demo_seed",
    source_detail: "factoryos_demo_v1"
  };

  const lineData = {
    company_name: "L.V. Spada"
  };

  const equipmentData = {
    equipment_name: "Prensa Hidráulica PH-800"
  };

  // Filter state with defaults
  const [filters, setFilters] = useState({
    line: "Línea de Ensamble Principal",
    equipment: "Prensa Hidráulica PH-800",
    shift: "Turno Mañana",
    dateRange: "last_7_days"
  });

  // Equipment technical data
  const theoreticalCapacityHour = (60 / shiftData.cycle_time_min).toFixed(1);
  const technicalData = {
    line: "Línea de Ensamble Principal",
    equipment: "Prensa Hidráulica PH-800 (Torno Automático T.01)",
    cycleTime: `${shiftData.cycle_time_min.toFixed(3)} min/pieza`,
    shiftDuration: `${shiftData.planned_time_min} min`,
    theoreticalCapacityHour: `${theoreticalCapacityHour} JPH`,
    theoreticalCapacityShift: `${shiftData.theoretical_output_units} JPSHIFT`,
    plannedDowntime: `${shiftData.planned_downtime_min} min`,
    unplannedDowntime: `${shiftData.unplanned_downtime_min} min`
  };

  // KPIs from shift data
  const avgAvailability = shiftData.availability_ratio;
  const avgPerformance = shiftData.performance_ratio;
  const avgQuality = shiftData.quality_ratio;
  const avgOee = shiftData.oee_total;

  // Determine OEE band
  const getOeeBand = (oee: number, language: string) => {
    if (oee >= 0.95) return language === "en" ? "Excellent" : "Excelente";
    if (oee >= 0.85) return language === "en" ? "Good" : "Bueno";
    if (oee >= 0.75) return language === "en" ? "Acceptable" : "Aceptable";
    if (oee >= 0.65) return language === "en" ? "Fair" : "Regular";
    return language === "en" ? "Unacceptable" : "Inaceptable";
  };

  const getOeeBandColor = (oee: number) => {
    if (oee >= 0.95) return "#00C853";
    if (oee >= 0.85) return "#64DD17";
    if (oee >= 0.75) return "#FFD600";
    if (oee >= 0.65) return "#FF6D00";
    return "#D50000";
  };

  // Prepare chart data - single shift point
  const chartData = [{
    hour: format(parseISO(shiftData.shift_started_at_tz), "HH:mm"),
    fullTime: shiftData.shift_started_at_tz,
    oee: (shiftData.oee_total * 100).toFixed(1),
    availability: (shiftData.availability_ratio * 100).toFixed(1),
    performance: (shiftData.performance_ratio * 100).toFixed(1),
    quality: (shiftData.quality_ratio * 100).toFixed(1),
    color: getOeeBandColor(shiftData.oee_total)
  }];

  // Prepare table data
  const tableColumns = [
    { header: t("shift"), accessor: (row: any) => format(parseISO(row.shift_started_at_tz), "HH:mm") },
    { header: t("availability") + " (%)", accessor: (row: any) => (row.availability_ratio * 100).toFixed(1) },
    { header: t("performance") + " (%)", accessor: (row: any) => (row.performance_ratio * 100).toFixed(1) },
    { header: t("quality") + " (%)", accessor: (row: any) => (row.quality_ratio * 100).toFixed(1) },
    { header: "OEE (%)", accessor: (row: any) => (row.oee_total * 100).toFixed(1) },
    { header: t("band"), accessor: "oee_band_es" as any },
    { header: t("units"), accessor: "total_units" as any },
    { header: t("defective"), accessor: "defective_units" as any }
  ];

  const tableData = [{ ...shiftData, id: shiftData.id_record }];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.hour}</p>
          <p className="text-sm" style={{ color: "#00C853" }}>OEE: {payload[0].payload.oee}%</p>
          <p className="text-sm text-muted-foreground">{t("availability")}: {payload[0].payload.availability}%</p>
          <p className="text-sm text-muted-foreground">{t("performance")}: {payload[0].payload.performance}%</p>
          <p className="text-sm text-muted-foreground">{t("quality")}: {payload[0].payload.quality}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{lineData.company_name} — {t("hourly_oee_analysis")}</h1>
          <p className="text-muted-foreground">{t("hourly_normalized_metrics")}</p>
        </div>
        <Select value="spada" onValueChange={(val) => navigate(`/demo/${val}`)}>
          <SelectTrigger className="w-64 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="schaeffler">🏭 {t("demo_schaeffler")}</SelectItem>
            <SelectItem value="spada">⚙️ {t("demo_spada")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters Card */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t('filter_label')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>{t('select_line_label')}</Label>
            <Select value={filters.line} onValueChange={(value) => setFilters({...filters, line: value})}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="Línea de Ensamble Principal">Línea de Ensamble Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('select_equipment_label')}</Label>
            <Select value={filters.equipment} onValueChange={(value) => setFilters({...filters, equipment: value})}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="Prensa Hidráulica PH-800">Prensa Hidráulica PH-800</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('select_shift_label')}</Label>
            <Select value={filters.shift} onValueChange={(value) => setFilters({...filters, shift: value})}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="Turno Mañana">Turno Mañana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('select_range_label')}</Label>
            <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="last_7_days">{t('range_last_7_days')}</SelectItem>
                <SelectItem value="last_14_days">{t('range_last_14_days')}</SelectItem>
                <SelectItem value="last_30_days">{t('range_last_30_days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title={t("availability")}
          value={(avgAvailability * 100).toFixed(1)}
          unit="%"
          icon={Activity}
          status="good"
        />
        <KPICard
          title={t("performance")}
          value={(avgPerformance * 100).toFixed(1)}
          unit="%"
          icon={Gauge}
          status="good"
        />
        <KPICard
          title={t("quality")}
          value={(avgQuality * 100).toFixed(1)}
          unit="%"
          icon={CheckCircle}
          status="good"
        />
        <Card className="bg-metric-bg border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">OEE Total</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: getOeeBandColor(avgOee) }}>
                  {(avgOee * 100).toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs font-medium" style={{ color: getOeeBandColor(avgOee) }}>
                {getOeeBand(avgOee, language)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Technical Data */}
      <EquipmentTechnicalData data={technicalData} />

      {/* Data Table */}
      <Card className="p-6 bg-card border-border">
        <CardHeader>
          <CardTitle>{t("shift_summary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={tableData} 
            columns={tableColumns} 
            emptyMessage={t("no_data")}
          />
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => navigate("/dashboard")}>
        ← {t("back_to_dashboard")}
      </Button>
    </div>
  );
}
