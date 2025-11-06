import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, TrendingUp } from "lucide-react";
import { OeeDashboardKPIs } from "@/components/OeeDashboardKPIs";
import { OeeTrendChart } from "@/components/OeeTrendChart";

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

interface DailyOeeData {
  calendar_date: string;
  availability_avg: number;
  performance_avg: number;
  quality_avg: number;
  oee_avg: number;
  total_units_sum: number;
  defective_units_sum: number;
}

interface Filters {
  id_line: string;
  id_equipment: string;
  range: number;
}

export default function OeeDashboard() {
  const [filters, setFilters] = useState<Filters>({
    id_line: "all-lines",
    id_equipment: "all-equipment",
    range: 7,
  });
  const [dailyData, setDailyData] = useState<DailyOeeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchOeeData = async () => {
    setIsLoading(true);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.id_line !== "all-lines") params.append("id_line", filters.id_line);
      if (filters.id_equipment !== "all-equipment") params.append("id_equipment", filters.id_equipment);
      params.append("days", filters.range.toString());

      // Call GET /api/v1/reports/oee-daily.csv
      // const response = await fetch(`/api/v1/reports/oee-daily.csv?${params.toString()}`);
      // const csvText = await response.text();
      
      // Parse CSV
      // const parsed = parseCSV(csvText);
      
      // Mock CSV data
      const mockCsvData = generateMockDailyData(filters.range);
      setDailyData(mockCsvData);
      
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
          <h1 className="text-3xl font-bold mb-2">OEE Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor overall equipment effectiveness trends and performance metrics
          </p>
        </div>
        <Button 
          onClick={fetchOeeData} 
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Dashboard Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Production Line</Label>
            <Select
              value={filters.id_line}
              onValueChange={(value) => updateFilter("id_line", value)}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockLines.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Equipment</Label>
            <Select
              value={filters.id_equipment}
              onValueChange={(value) => updateFilter("id_equipment", value)}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockEquipment.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select
              value={filters.range.toString()}
              onValueChange={(value) => updateFilter("range", parseInt(value))}
            >
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <OeeDashboardKPIs data={dailyData} isLoading={isLoading} />

      {/* Trend Chart */}
      <OeeTrendChart data={dailyData} isLoading={isLoading} />

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
function generateMockDailyData(days: number): DailyOeeData[] {
  const data: DailyOeeData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const availability = 0.75 + Math.random() * 0.2;
    const performance = 0.70 + Math.random() * 0.25;
    const quality = 0.88 + Math.random() * 0.10;
    const oee = availability * performance * quality;
    
    data.push({
      calendar_date: date.toISOString().split("T")[0],
      availability_avg: availability,
      performance_avg: performance,
      quality_avg: quality,
      oee_avg: oee,
      total_units_sum: Math.floor(2000 + Math.random() * 1000),
      defective_units_sum: Math.floor(20 + Math.random() * 50),
    });
  }
  
  return data;
}
