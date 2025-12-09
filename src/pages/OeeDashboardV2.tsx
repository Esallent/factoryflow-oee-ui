import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  RefreshCw, 
  TrendingUp, 
  BarChart3, 
  Factory,
  Workflow,
  Wrench,
  Clock,
  Puzzle
} from "lucide-react";
import { format, subDays } from "date-fns";
import { OeeDashboardKPIs } from "@/components/OeeDashboardKPIs";
import { OeeTrendChart } from "@/components/OeeTrendChart";
import { OeeWaterfallChart } from "@/components/OeeWaterfallChart";
import { EquipmentComparisonChart } from "@/components/EquipmentComparisonChart";
import { EmptyDataCard } from "@/components/EmptyDataCard";
import { WeightedOeeBadge } from "@/components/WeightedOeeBadge";
import { useTranslation } from "@/contexts/LanguageContext";
import type { EquipmentComparisonData, DataSource } from "@/types/oee";

// Mock hierarchical data
const mockPlants = [
  { id: "plant-1", name: "Planta Principal" },
  { id: "plant-2", name: "Planta Norte" },
];

const mockLinesByPlant: Record<string, { id: string; name: string }[]> = {
  "plant-1": [
    { id: "line-1", name: "Línea de Producción A" },
    { id: "line-2", name: "Línea de Producción B" },
  ],
  "plant-2": [
    { id: "line-3", name: "Línea de Ensamblaje C" },
  ],
};

const mockEquipmentByLine: Record<string, { id: string; name: string }[]> = {
  "line-1": [
    { id: "eq-1", name: "CNC Machine #1" },
    { id: "eq-2", name: "CNC Machine #2" },
    { id: "eq-3", name: "Robotic Arm #1" },
  ],
  "line-2": [
    { id: "eq-4", name: "Assembly Station A" },
    { id: "eq-5", name: "Assembly Station B" },
  ],
  "line-3": [
    { id: "eq-6", name: "Welding Robot #1" },
  ],
};

const mockShifts = [
  { id: "shift-1", name: "Turno Mañana", start: "06:00", end: "14:00" },
  { id: "shift-2", name: "Turno Tarde", start: "14:00", end: "22:00" },
  { id: "shift-3", name: "Turno Noche", start: "22:00", end: "06:00" },
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
  data_source?: DataSource;
}

interface FiltersV21 {
  plant_id: string;
  line_id: string;
  equipment_id: string;
  shift_id: string;
  range: number;
  compare_enabled: boolean;
  compare_equipment_id: string;
  range_type: string;
}

export default function OeeDashboardV2() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<FiltersV21>({
    plant_id: "all",
    line_id: "all",
    equipment_id: "all",
    shift_id: "all",
    range: 7,
    compare_enabled: false,
    compare_equipment_id: "",
    range_type: "last_7_days",
  });
  
  const [dailyData, setDailyData] = useState<DailyOeeData[]>([]);
  const [previousData, setPreviousData] = useState<DailyOeeData[]>([]);
  const [comparisonData, setComparisonData] = useState<EquipmentComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noDataWarning, setNoDataWarning] = useState<string | null>(null);

  // Derived state for dependent selectors
  const availableLines = filters.plant_id !== "all" 
    ? mockLinesByPlant[filters.plant_id] || [] 
    : Object.values(mockLinesByPlant).flat();
    
  const availableEquipment = filters.line_id !== "all"
    ? mockEquipmentByLine[filters.line_id] || []
    : Object.values(mockEquipmentByLine).flat();

  const updateFilter = (key: keyof FiltersV21, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      // Reset dependent filters when parent changes
      if (key === "plant_id") {
        newFilters.line_id = "all";
        newFilters.equipment_id = "all";
      }
      if (key === "line_id") {
        newFilters.equipment_id = "all";
      }
      
      return newFilters;
    });
  };

  const fetchOeeData = async () => {
    setIsLoading(true);
    setNoDataWarning(null);
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockCsvData = generateMockDailyData(filters.range);
      
      if (mockCsvData.length === 0) {
        setNoDataWarning("Sin datos disponibles para el período seleccionado.");
        setDailyData([]);
        setPreviousData([]);
        setComparisonData([]);
        return;
      }
      
      setDailyData(mockCsvData);

      if (filters.compare_enabled) {
        const mockCompareData = generateMockDailyData(filters.range, true);
        setPreviousData(mockCompareData);
      } else {
        setPreviousData([]);
      }

      // Generate equipment comparison data if a line is selected
      if (filters.line_id !== "all") {
        setComparisonData(generateMockComparisonData(filters.line_id));
      } else {
        setComparisonData([]);
      }
      
    } catch (error) {
      console.error("Failed to fetch OEE data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar datos del dashboard OEE",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOeeData();
  }, [filters]);

  // Calculate weighted OEE for display
  const weightedOeeData = dailyData.length > 0 ? {
    avgOee: dailyData.reduce((s, d) => s + d.oee_avg, 0) / dailyData.length,
    totalToMin: dailyData.reduce((s, d) => s + (d.available_time_min || 480) * d.availability_avg, 0),
  } : null;

  const handleEquipmentClick = (equipmentId: string) => {
    navigate(`/equipment-detail?equipment_id=${equipmentId}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard OEE 2.1</h1>
          <p className="text-muted-foreground">
            Vista por equipo con métricas ponderadas y comparativas de línea
          </p>
        </div>
        <div className="flex items-center gap-3">
          {weightedOeeData && (
            <WeightedOeeBadge 
              oee={weightedOeeData.avgOee} 
              toMin={weightedOeeData.totalToMin}
            />
          )}
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
      </div>

      {/* Hierarchical Filters Card */}
      <Card className="p-6 bg-card border-border sticky top-4 z-10 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filtros Jerárquicos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Plant Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-muted-foreground" />
              Planta
            </Label>
            <Select value={filters.plant_id} onValueChange={(v) => updateFilter("plant_id", v)}>
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Todas las Plantas</SelectItem>
                {mockPlants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Line Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-muted-foreground" />
              Línea
            </Label>
            <Select 
              value={filters.line_id} 
              onValueChange={(v) => updateFilter("line_id", v)}
              disabled={filters.plant_id === "all"}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Todas las Líneas</SelectItem>
                {availableLines.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Equipment Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              Equipo
            </Label>
            <Select 
              value={filters.equipment_id} 
              onValueChange={(v) => updateFilter("equipment_id", v)}
              disabled={filters.line_id === "all"}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Todos los Equipos</SelectItem>
                {availableEquipment.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shift Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Turno
            </Label>
            <Select value={filters.shift_id} onValueChange={(v) => updateFilter("shift_id", v)}>
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Todos los Turnos</SelectItem>
                {mockShifts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.start}-{s.end})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
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

          {/* Compare Toggle */}
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
        <EmptyDataCard 
          type="no-data" 
          title="Sin datos" 
          message={noDataWarning}
          onRetry={fetchOeeData}
          showRetry
        />
      )}

      {/* KPI Cards */}
      {!noDataWarning && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Indicadores Clave</h2>
            {filters.equipment_id !== "all" && (
              <span className="text-sm text-muted-foreground ml-2">
                • {availableEquipment.find(e => e.id === filters.equipment_id)?.name}
              </span>
            )}
          </div>
          <OeeDashboardKPIs 
            data={dailyData} 
            previousData={previousData}
            isLoading={isLoading}
            compareEnabled={filters.compare_enabled}
          />
        </div>
      )}

      {/* Equipment Comparison Chart - Only show when line is selected */}
      {!noDataWarning && filters.line_id !== "all" && (
        <EquipmentComparisonChart
          data={comparisonData}
          isLoading={isLoading}
          onEquipmentClick={handleEquipmentClick}
        />
      )}

      {/* Trend Chart */}
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

// Mock data generators
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
      data_source: ["auto", "manual", "mixed"][Math.floor(Math.random() * 3)] as DataSource,
    });
  }
  
  return data;
}

function generateMockComparisonData(lineId: string): EquipmentComparisonData[] {
  const equipment = mockEquipmentByLine[lineId] || [];
  const lineAvg = 0.75;
  
  return equipment.map((eq, index) => {
    const oee = 0.65 + Math.random() * 0.30;
    return {
      equipment_id: eq.id,
      equipment_name: eq.name,
      line_id: lineId,
      line_name: mockLinesByPlant["plant-1"]?.find(l => l.id === lineId)?.name || "Línea",
      availability: 0.80 + Math.random() * 0.15,
      performance: 0.75 + Math.random() * 0.20,
      quality: 0.90 + Math.random() * 0.08,
      oee,
      rank: index + 1,
      oee_delta_vs_line_avg: oee - lineAvg,
      to_min: 400 + Math.random() * 80,
      total_units: Math.floor(1500 + Math.random() * 800),
    };
  }).sort((a, b) => b.oee - a.oee);
}
