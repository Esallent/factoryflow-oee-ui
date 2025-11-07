import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, TrendingUp, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { OeeDashboardKPIs } from "@/components/OeeDashboardKPIs";
import { OeeTrendChart } from "@/components/OeeTrendChart";
import { OeeWaterfallChart } from "@/components/OeeWaterfallChart";
import { useTranslation } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";

// Mock data
const mockLines = [
  { id: "all-lines", name: "Todas las Líneas" },
  { id: "line-1", name: "Línea de Producción A" },
  { id: "line-2", name: "Línea de Producción B" },
];

const mockEquipment = [
  { id: "all-equipment", name: "Todos los Equipos" },
  { id: "eq-1", name: "Máquina CNC #1" },
  { id: "eq-2", name: "Máquina CNC #2" },
];

const mockShifts = [
  { id: "all-shifts", name: "Todos los Turnos" },
  { id: "shift-1", name: "Turno Mañana (6:00-14:00)" },
  { id: "shift-2", name: "Turno Tarde (14:00-22:00)" },
  { id: "shift-3", name: "Turno Noche (22:00-6:00)" },
];

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

interface Filters {
  id_line: string;
  id_equipment: string;
  id_shift: string;
  range: number;
  compare_enabled: boolean;
  range_type: string;
}

export default function OeeDashboardV2() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({
    id_line: "all-lines",
    id_equipment: "all-equipment",
    id_shift: "all-shifts",
    range: 7,
    compare_enabled: false,
    range_type: "last_7_days",
  });
  const [dailyData, setDailyData] = useState<DailyOeeData[]>([]);
  const [previousData, setPreviousData] = useState<DailyOeeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noDataWarning, setNoDataWarning] = useState<string | null>(null);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchOeeData = async () => {
    setIsLoading(true);
    setNoDataWarning(null);
    
    try {
      // Mock CSV data
      const mockCsvData = generateMockDailyData(filters.range);
      
      if (mockCsvData.length === 0) {
        setNoDataWarning("Sin datos disponibles para el período seleccionado.");
        setDailyData([]);
        setPreviousData([]);
        return;
      }
      
      setDailyData(mockCsvData);

      if (filters.compare_enabled) {
        const mockCompareData = generateMockDailyData(filters.range, true);
        setPreviousData(mockCompareData);
      } else {
        setPreviousData([]);
      }
      
    } catch (error) {
      console.error("Failed to fetch OEE data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load OEE dashboard data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOeeData();
  }, [filters]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard OEE 2.0</h1>
          <p className="text-muted-foreground">
            Vista comparativa con análisis de cascada de pérdidas y tendencias
          </p>
        </div>
        <Button 
          onClick={fetchOeeData} 
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Persistent Filters Card */}
      <Card className="p-6 bg-card border-border sticky top-4 z-10 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Línea</Label>
            <Select
              value={filters.id_line}
              onValueChange={(value) => updateFilter("id_line", value)}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {mockLines.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Equipo</Label>
            <Select
              value={filters.id_equipment}
              onValueChange={(value) => updateFilter("id_equipment", value)}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {mockEquipment.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Turno</Label>
            <Select
              value={filters.id_shift}
              onValueChange={(value) => updateFilter("id_shift", value)}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {mockShifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rango de Fechas</Label>
            <Select
              value={filters.range_type}
              onValueChange={(value) => {
                updateFilter("range_type", value);
                const rangeDays: Record<string, number> = {
                  last_7_days: 7,
                  last_14_days: 14,
                  last_30_days: 30,
                  this_week: 7,
                  last_week: 7,
                  this_month: 30,
                  last_month: 30,
                  this_quarter: 90,
                  this_year: 365,
                };
                updateFilter("range", rangeDays[value] || 7);
              }}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="last_7_days">Últimos 7 días</SelectItem>
                <SelectItem value="last_14_days">Últimos 14 días</SelectItem>
                <SelectItem value="last_30_days">Últimos 30 días</SelectItem>
                <SelectItem value="this_week">Esta semana</SelectItem>
                <SelectItem value="last_week">Semana pasada</SelectItem>
                <SelectItem value="this_month">Este mes</SelectItem>
                <SelectItem value="last_month">Mes pasado</SelectItem>
                <SelectItem value="this_quarter">Este trimestre</SelectItem>
                <SelectItem value="this_year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Comparar Períodos</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                checked={filters.compare_enabled}
                onCheckedChange={(checked) => updateFilter("compare_enabled", checked)}
              />
              <span className="text-sm text-muted-foreground">
                {filters.compare_enabled ? "Activado" : "Desactivado"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* No Data Warning */}
      {noDataWarning && (
        <Card className="p-6 bg-status-warning/10 border-status-warning/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-foreground font-medium">{noDataWarning}</p>
          </div>
        </Card>
      )}

      {/* KPI Cards with Delta */}
      {!noDataWarning && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Indicadores Clave</h2>
          </div>
          <OeeDashboardKPIs 
            data={dailyData} 
            previousData={previousData}
            isLoading={isLoading}
            compareEnabled={filters.compare_enabled}
          />
        </div>
      )}

      {/* Trend Chart with Comparison Lines */}
      {!noDataWarning && (
        <OeeTrendChart 
          data={dailyData} 
          previousData={previousData}
          isLoading={isLoading}
          compareEnabled={filters.compare_enabled}
        />
      )}

      {/* Waterfall Chart - Loss Cascade */}
      {!noDataWarning && (
        <OeeWaterfallChart 
          data={dailyData} 
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Mock data generator
function generateMockDailyData(days: number, isPrevious = false): DailyOeeData[] {
  const data: DailyOeeData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    if (isPrevious) {
      date.setDate(date.getDate() - i - days);
    } else {
      date.setDate(date.getDate() - i);
    }
    
    const baseVariation = isPrevious ? -0.05 : 0;
    const availability = 0.75 + Math.random() * 0.2 + baseVariation;
    const performance = 0.70 + Math.random() * 0.25 + baseVariation;
    const quality = 0.88 + Math.random() * 0.10 + baseVariation;
    const oee = availability * performance * quality;
    
    const totalUnits = Math.floor(2000 + Math.random() * 1000);
    const availableTimeMin = 480;
    const cycleTimeMin = 0.25;
    const expectedUnits = Math.floor(availableTimeMin / cycleTimeMin);
    
    data.push({
      calendar_date: date.toISOString().split("T")[0],
      availability_avg: availability,
      performance_avg: performance,
      quality_avg: quality,
      oee_avg: oee,
      total_units_sum: totalUnits,
      defective_units_sum: Math.floor(20 + Math.random() * 50),
      expected_units: expectedUnits,
      available_time_min: availableTimeMin,
      cycle_time_min: cycleTimeMin,
    });
  }
  
  return data;
}
