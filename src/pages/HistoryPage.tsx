import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OeeHistoryTable } from "@/components/OeeHistoryTable";
import { DatePicker } from "@/components/DatePicker";
import { useTranslation } from "@/contexts/LanguageContext";

// Mock data
const mockLines = [
  { id: "line-1", name: "Production Line A" },
  { id: "line-2", name: "Production Line B" },
];

const mockEquipment = [
  { id: "eq-1", name: "CNC Machine #1" },
  { id: "eq-2", name: "CNC Machine #2" },
];

const mockShifts = [
  { id: "shift-1", name: "Morning Shift" },
  { id: "shift-2", name: "Afternoon Shift" },
  { id: "shift-3", name: "Night Shift" },
];

interface Filters {
  id_line?: string;
  id_equipment?: string;
  id_shift?: string;
  from_date?: Date;
  to_date?: Date;
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({});
  const [isExporting, setIsExporting] = useState(false);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters.id_line) params.append("id_line", filters.id_line);
      if (filters.id_equipment) params.append("id_equipment", filters.id_equipment);
      if (filters.id_shift) params.append("id_shift", filters.id_shift);
      if (filters.from_date) params.append("from_date", filters.from_date.toISOString());
      if (filters.to_date) params.append("to_date", filters.to_date.toISOString());

      // Call GET /api/v1/records/export.csv
      // const response = await fetch(`/api/v1/records/export.csv?${params.toString()}`);
      
      // if (!response.ok) {
      //   throw new Error(`HTTP ${response.status}`);
      // }
      
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `oee_records_${Date.now()}.csv`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);

      // Simulate export (will fail in mock)
      console.log("Export CSV with filters:", params.toString());
      throw new Error("404"); // Simulate endpoint not available
      
    } catch (error: any) {
      const status = error.message;
      
      if (status === "404" || status === "500" || error.status === 404 || error.status === 500) {
        toast({
          title: "Export Not Available",
          description: "Export CSV not available in this version.",
          variant: "destructive",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: "Failed to export CSV. Please try again.",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('production_history')}</h1>
          <p className="text-muted-foreground">
            {t('history_subtitle')}
          </p>
        </div>
        <Button 
          onClick={handleExportCSV} 
          disabled={isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? t('loading') : t('export')}
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t('filter')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>{t('select_line')}</Label>
            <Select
              value={filters.id_line || "all-lines"}
              onValueChange={(value) => updateFilter("id_line", value === "all-lines" ? undefined : value)}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder={t('all_lines')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all-lines">{t('all_lines')}</SelectItem>
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
              value={filters.id_equipment || "all-equipment"}
              onValueChange={(value) => updateFilter("id_equipment", value === "all-equipment" ? undefined : value)}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder={t('all_equipment')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all-equipment">{t('all_equipment')}</SelectItem>
                {mockEquipment.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('shift')}</Label>
            <Select
              value={filters.id_shift || "all-shifts"}
              onValueChange={(value) => updateFilter("id_shift", value === "all-shifts" ? undefined : value)}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder={t('all_shifts')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all-shifts">{t('all_shifts')}</SelectItem>
                {mockShifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('date')}</Label>
            <DatePicker
              value={filters.from_date}
              onChange={(date) => updateFilter("from_date", date)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('date')}</Label>
            <DatePicker
              value={filters.to_date}
              onChange={(date) => updateFilter("to_date", date)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={clearFilters} size="sm">
            {t('filter')}
          </Button>
        </div>
      </Card>

      {/* History Table */}
      <OeeHistoryTable filters={filters} />
    </div>
  );
}
