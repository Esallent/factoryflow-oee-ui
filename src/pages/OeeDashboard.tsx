import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, TrendingUp, Factory } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OeeDashboardKPIs } from "@/components/OeeDashboardKPIs";
import { OeeTrendChart } from "@/components/OeeTrendChart";
import { useTranslation } from "@/contexts/LanguageContext";

// Mock data
const mockLines = [
  { id: "all-lines", name: "All Lines" },
  { id: "line-1", name: "Production Line A" },
  { id: "line-2", name: "Production Line B" },
];

const mockEquipment = [
  { id: "all-equipment", name: "All Equipment" },
  { id: "eq-1", name: "CNC Machine #1" },
  { id: "eq-2", name: "CNC Machine #2" },
];

const mockShifts = [
  { id: "all-shifts", name: "All Shifts" },
  { id: "shift-1", name: "Morning Shift (6:00-14:00)" },
  { id: "shift-2", name: "Evening Shift (14:00-22:00)" },
  { id: "shift-3", name: "Night Shift (22:00-6:00)" },
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
  range_type: string; // Future-proof for v2: "last_7_days", "custom", etc.
}

export default function OeeDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({
    id_line: "all-lines",
    id_equipment: "all-equipment",
    id_shift: "all-shifts",
    range: 7,
    compare_enabled: false,
    range_type: "last_7_days", // Future-proof for v2
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
      // Build query params
      const params = new URLSearchParams();
      if (filters.id_line !== "all-lines") params.append("id_line", filters.id_line);
      if (filters.id_equipment !== "all-equipment") params.append("id_equipment", filters.id_equipment);
      if (filters.id_shift !== "all-shifts") params.append("id_shift", filters.id_shift);
      params.append("days", filters.range.toString());
      params.append("range_type", filters.range_type);

      // Call GET /api/v1/reports/oee-daily.csv
      // const response = await fetch(`/api/v1/reports/oee-daily.csv?${params.toString()}`);
      // const csvText = await response.text();
      
      // Parse CSV
      // const parsed = parseCSV(csvText);
      
      // Mock CSV data
      const mockCsvData = generateMockDailyData(filters.range);
      
      // Handle empty data or warning response
      if (mockCsvData.length === 0) {
        setNoDataWarning("Sin datos disponibles para el período seleccionado.");
        setDailyData([]);
        setPreviousData([]);
        return;
      }
      
      setDailyData(mockCsvData);

      // Fetch comparison data if enabled
      if (filters.compare_enabled) {
        // const compareParams = new URLSearchParams(params);
        // compareParams.append("compare", "previous");
        // const compareResponse = await fetch(`/api/v1/reports/oee-daily.csv?${compareParams.toString()}`);
        // const compareText = await compareResponse.text();
        // const parsedCompare = parseCSV(compareText);
        
        const mockCompareData = generateMockDailyData(filters.range, true);
        setPreviousData(mockCompareData);
      } else {
        setPreviousData([]);
      }
      
    } catch (error) {
      console.error("Failed to fetch OEE data:", error);
      
      // Fallback to JSON parsing
      try {
        // const jsonResponse = await fetch(`/api/v1/reports/oee-daily?${params.toString()}`);
        // const jsonData = await jsonResponse.json();
        // setDailyData(jsonData);
        
        toast({
          title: "CSV Parse Failed",
          description: "Falling back to JSON data format",
        });
      } catch (jsonError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load OEE dashboard data",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOeeData();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('dashboard')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard_subtitle')}
          </p>
        </div>
        <Button 
          onClick={fetchOeeData} 
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t('filter')}
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t('filter')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>{t('select_line')}</Label>
            <Select
              value={filters.id_line}
              onValueChange={(value) => updateFilter("id_line", value)}
            >
              <SelectTrigger className="bg-card border-border">
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
            <Label>{t('select_equipment')}</Label>
            <Select
              value={filters.id_equipment}
              onValueChange={(value) => updateFilter("id_equipment", value)}
            >
              <SelectTrigger className="bg-card border-border">
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
            <Label>{t('select_shift')}</Label>
            <Select
              value={filters.id_shift}
              onValueChange={(value) => updateFilter("id_shift", value)}
            >
              <SelectTrigger className="bg-card border-border">
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
            <Label>{t('select_range')}</Label>
            <Select
              value={filters.range.toString()}
              onValueChange={(value) => updateFilter("range", parseInt(value))}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="7">{t('days_7')}</SelectItem>
                <SelectItem value="30">{t('days_30')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="compare-toggle"
            checked={filters.compare_enabled}
            onChange={(e) => updateFilter("compare_enabled", e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <Label htmlFor="compare-toggle" className="cursor-pointer">
            {t('compare_periods')}
          </Label>
        </div>
      </Card>

      {/* No Data Warning Banner */}
      {noDataWarning && (
        <Card className="p-6 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗨️</span>
            <p className="text-foreground font-medium">{noDataWarning}</p>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      {!noDataWarning && (
        <OeeDashboardKPIs 
          data={dailyData} 
          previousData={previousData}
          isLoading={isLoading}
          compareEnabled={filters.compare_enabled}
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

      {/* Demo Pages Section */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Factory className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Demo Pages — Hourly Analysis</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Explore detailed hourly OEE analysis for demo companies with normalized datasets
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/demo/schaeffler")}
            variant="outline"
            className="h-auto py-4 px-6 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏭</span>
              <span className="font-semibold">Schaeffler México</span>
            </div>
            <span className="text-xs text-muted-foreground">
              View hourly OEE metrics and performance bands
            </span>
          </Button>
          <Button
            onClick={() => navigate("/demo/spada")}
            variant="outline"
            className="h-auto py-4 px-6 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span className="font-semibold">L.V. Spada</span>
            </div>
            <span className="text-xs text-muted-foreground">
              View hourly OEE metrics and performance bands
            </span>
          </Button>
        </div>
      </Card>

      {/* Hidden placeholders for future features */}
      {/* 
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">Weekly OEE Trend</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>Weekly aggregation coming soon</p>
          <p className="text-xs mt-2">Endpoint: GET /api/v1/reports/oee-weekly.csv</p>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">Downtime Pareto Analysis</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>Pareto chart for downtime causes coming soon</p>
          <p className="text-xs mt-2">Endpoint: GET /api/v1/reports/downtime-pareto.csv</p>
        </div>
      </Card>
      */}
    </div>
  );
}

// CSV Parser helper
function parseCSV(csvText: string): DailyOeeData[] {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const row: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      // Parse numbers with decimal point
      if (header.includes("_avg") || header.includes("_sum") || header.includes("_ratio")) {
        row[header] = parseFloat(value.replace(",", "."));
      } else {
        row[header] = value;
      }
    });
    
    return row as DailyOeeData;
  });
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
    const availableTimeMin = 480; // 8 hours
    const cycleTimeMin = 0.25; // 15 seconds per unit
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
