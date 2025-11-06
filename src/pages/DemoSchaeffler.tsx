import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Gauge, CheckCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { demoDataset } from "@/data/demoDataset";
import { format, parseISO } from "date-fns";
import { useTranslation } from "@/contexts/LanguageContext";

export default function DemoSchaeffler() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const companyKey = "company_1";
  const companyData = demoDataset.fact_oee_hourly[companyKey];
  const lineData = demoDataset.dim_line[companyKey];
  const equipmentData = demoDataset.dim_equipment[companyKey];
  const shiftData = demoDataset.dim_shift[companyKey];

  // Calculate average KPIs
  const avgAvailability = companyData.reduce((sum, r) => sum + r.availability_ratio, 0) / companyData.length;
  const avgPerformance = companyData.reduce((sum, r) => sum + r.performance_ratio, 0) / companyData.length;
  const avgQuality = companyData.reduce((sum, r) => sum + r.quality_ratio, 0) / companyData.length;
  const avgOee = avgAvailability * avgPerformance * avgQuality;

  // Determine OEE band
  const getOeeBand = (oee: number) => {
    if (oee >= 0.95) return "Excelencia";
    if (oee >= 0.85) return "Bueno";
    if (oee >= 0.75) return "Aceptable";
    if (oee >= 0.65) return "Regular";
    return "Inaceptable";
  };

  const getOeeBandColor = (oee: number) => {
    if (oee >= 0.95) return "#00C853";
    if (oee >= 0.85) return "#64DD17";
    if (oee >= 0.75) return "#FFD600";
    if (oee >= 0.65) return "#FF6D00";
    return "#D50000";
  };

  // Prepare chart data
  const chartData = companyData.map(record => ({
    hour: format(parseISO(record.ts_hour), "HH:mm"),
    fullTime: record.ts_hour,
    oee: (record.oee_total * 100).toFixed(1),
    availability: (record.availability_ratio * 100).toFixed(1),
    performance: (record.performance_ratio * 100).toFixed(1),
    quality: (record.quality_ratio * 100).toFixed(1),
    color: getOeeBandColor(record.oee_total)
  }));

  // Prepare table data
  const tableColumns = [
    { header: "Hora", accessor: (row: any) => format(parseISO(row.ts_hour), "HH:mm") },
    { header: t("availability") + " (%)", accessor: (row: any) => (row.availability_ratio * 100).toFixed(1) },
    { header: t("performance") + " (%)", accessor: (row: any) => (row.performance_ratio * 100).toFixed(1) },
    { header: t("quality") + " (%)", accessor: (row: any) => (row.quality_ratio * 100).toFixed(1) },
    { header: "OEE (%)", accessor: (row: any) => (row.oee_total * 100).toFixed(1) },
    { header: "Banda", accessor: "oee_band_es" as any },
    { header: "Unidades", accessor: "total_units" as any },
    { header: "Defectuosas", accessor: "defective_units" as any }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.hour}</p>
          <p className="text-sm" style={{ color: "#00C853" }}>OEE: {payload[0].payload.oee}%</p>
          <p className="text-sm text-muted-foreground">Disponibilidad: {payload[0].payload.availability}%</p>
          <p className="text-sm text-muted-foreground">Rendimiento: {payload[0].payload.performance}%</p>
          <p className="text-sm text-muted-foreground">Calidad: {payload[0].payload.quality}%</p>
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
          <h1 className="text-3xl font-bold">{lineData.company_name} — Análisis OEE Horario</h1>
          <p className="text-muted-foreground">Métricas normalizadas de rendimiento OEE por hora</p>
        </div>
        <Select value="schaeffler" onValueChange={(val) => navigate(`/demo/${val}`)}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="schaeffler">🏭 Schaeffler México</SelectItem>
            <SelectItem value="spada">⚙️ L.V. Spada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metadata Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Línea</p>
            <p className="font-semibold">{lineData.line_name}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Equipo</p>
            <p className="font-semibold">{equipmentData.equipment_name}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tiempo de Ciclo</p>
            <p className="font-semibold">{equipmentData.design_cycle_time_min} min</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Turno</p>
            <p className="font-semibold">{shiftData.shift_name}</p>
          </CardContent>
        </Card>
      </div>

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
                {getOeeBand(avgOee)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="p-6 bg-card border-border">
        <CardHeader>
          <CardTitle>Tendencia OEE por Hora</CardTitle>
          <p className="text-sm text-muted-foreground">{lineData.company_name} — {equipmentData.equipment_name}</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "14px" }} iconType="line" />
              <ReferenceLine y={95} stroke="#00C853" strokeDasharray="3 3" label="Excelencia" />
              <ReferenceLine y={85} stroke="#64DD17" strokeDasharray="3 3" label="Bueno" />
              <ReferenceLine y={75} stroke="#FFD600" strokeDasharray="3 3" label="Aceptable" />
              <ReferenceLine y={65} stroke="#FF6D00" strokeDasharray="3 3" label="Regular" />
              <Line type="monotone" dataKey="oee" stroke="#00C853" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="p-6 bg-card border-border">
        <CardHeader>
          <CardTitle>Registros Horarios</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={companyData} 
            columns={tableColumns} 
            emptyMessage="No hay datos disponibles" 
          />
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => navigate("/dashboard")}>
        ← Volver al {t("dashboard")}
      </Button>
    </div>
  );
}
