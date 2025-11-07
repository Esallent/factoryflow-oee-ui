import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Download, Filter, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type DataSource = "auto" | "mixed" | "manual";

interface OeeHistoryRecord {
  id_record: number;
  record_date: string;
  id_line: number;
  line_name: string;
  id_equipment: number;
  equipment_name: string;
  id_shift: number;
  shift_name: string;
  oee_total: number;
  availability_ratio: number;
  performance_ratio: number;
  quality_ratio: number;
  oee_band_code: string;
  oee_band_es: string;
  source: DataSource;
  validated: boolean;
  last_sync?: string;
  integration_name?: string;
}

const mockLines = [
  { id: "all", name: "Todas las Líneas" },
  { id: "1", name: "Línea de Producción A" },
  { id: "2", name: "Línea de Producción B" },
];

const mockEquipment = [
  { id: "all", name: "Todos los Equipos" },
  { id: "1", name: "Máquina CNC #1" },
  { id: "2", name: "Máquina CNC #2" },
];

const mockShifts = [
  { id: "all", name: "Todos los Turnos" },
  { id: "1", name: "Turno Mañana" },
  { id: "2", name: "Turno Tarde" },
  { id: "3", name: "Turno Noche" },
];

export default function HistoryPageV2() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<OeeHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  const [filters, setFilters] = useState({
    id_line: "all",
    id_equipment: "all",
    id_shift: "all",
    source: "all",
    validated: "all",
    dateFrom: "",
    dateTo: "",
  });

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      // const params = new URLSearchParams();
      // if (filters.id_line !== "all") params.append("id_line", filters.id_line);
      // if (filters.id_equipment !== "all") params.append("id_equipment", filters.id_equipment);
      // if (filters.id_shift !== "all") params.append("id_shift", filters.id_shift);
      // if (filters.source !== "all") params.append("source", filters.source);
      // if (filters.validated !== "all") params.append("validated", filters.validated);
      // if (filters.dateFrom) params.append("date_from", filters.dateFrom);
      // if (filters.dateTo) params.append("date_to", filters.dateTo);
      // const response = await fetch(`/api/v1/records/history?${params.toString()}`);
      // const data = await response.json();
      // setRecords(data);

      await new Promise(resolve => setTimeout(resolve, 500));
      setRecords(generateMockRecords(100));
    } catch (error) {
      console.error("Failed to fetch history records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  // Apply filters
  const filteredRecords = records.filter((record) => {
    if (filters.id_line !== "all" && record.id_line.toString() !== filters.id_line) return false;
    if (filters.id_equipment !== "all" && record.id_equipment.toString() !== filters.id_equipment) return false;
    if (filters.id_shift !== "all" && record.id_shift.toString() !== filters.id_shift) return false;
    if (filters.source !== "all" && record.source !== filters.source) return false;
    if (filters.validated !== "all") {
      const wantValidated = filters.validated === "true";
      if (record.validated !== wantValidated) return false;
    }
    if (filters.dateFrom && record.record_date < filters.dateFrom) return false;
    if (filters.dateTo && record.record_date > filters.dateTo) return false;
    return true;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const getOeeBandColor = (oee: number): string => {
    if (oee >= 0.95) return "bg-status-good text-white";
    if (oee >= 0.85) return "bg-green-600 text-white";
    if (oee >= 0.75) return "bg-blue-500 text-white";
    if (oee >= 0.65) return "bg-status-warning text-warning-foreground";
    return "bg-status-critical text-white";
  };

  const exportToCSV = () => {
    const headers = [
      "Fecha", "Línea", "Equipo", "Turno", "Disponibilidad", "Rendimiento", 
      "Calidad", "OEE", "Banda", "Origen", "Validado", "Última Sincronización"
    ];
    
    const csvData = filteredRecords.map(record => [
      record.record_date,
      record.line_name,
      record.equipment_name,
      record.shift_name,
      `${(record.availability_ratio * 100).toFixed(1)}%`,
      `${(record.performance_ratio * 100).toFixed(1)}%`,
      `${(record.quality_ratio * 100).toFixed(1)}%`,
      `${(record.oee_total * 100).toFixed(1)}%`,
      record.oee_band_es,
      record.source.toUpperCase(),
      record.validated ? "Sí" : "No",
      record.last_sync || "N/A",
    ]);

    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `history_oee_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Historial OEE 2.0</h1>
          <p className="text-muted-foreground">
            Registros históricos con origen de datos y validación
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Línea</Label>
            <Select value={filters.id_line} onValueChange={(value) => updateFilter("id_line", value)}>
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
            <Select value={filters.id_equipment} onValueChange={(value) => updateFilter("id_equipment", value)}>
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
            <Select value={filters.id_shift} onValueChange={(value) => updateFilter("id_shift", value)}>
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
            <Label>Origen de Datos</Label>
            <Select value={filters.source} onValueChange={(value) => updateFilter("source", value)}>
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Todos los Orígenes</SelectItem>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="mixed">Mixto</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado de Validación</Label>
            <Select value={filters.validated} onValueChange={(value) => updateFilter("validated", value)}>
              <SelectTrigger className="bg-sidebar border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Validado</SelectItem>
                <SelectItem value="false">Sin Validar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Desde</Label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-sidebar text-foreground text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha Hasta</Label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-sidebar text-foreground text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Mostrando {paginatedRecords.length} de {filteredRecords.length} registros
        </p>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} registros en total
          </span>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-semibold">Fecha</TableHead>
                <TableHead className="font-semibold">Línea</TableHead>
                <TableHead className="font-semibold">Equipo</TableHead>
                <TableHead className="font-semibold">Turno</TableHead>
                <TableHead className="font-semibold text-right">Disp.</TableHead>
                <TableHead className="font-semibold text-right">Rend.</TableHead>
                <TableHead className="font-semibold text-right">Cal.</TableHead>
                <TableHead className="font-semibold text-right">OEE</TableHead>
                <TableHead className="font-semibold">Banda</TableHead>
                <TableHead className="font-semibold">Origen</TableHead>
                <TableHead className="font-semibold text-center">Validado</TableHead>
                <TableHead className="font-semibold">Últ. Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    Cargando registros...
                  </TableCell>
                </TableRow>
              ) : paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros con los filtros seleccionados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record) => (
                  <TableRow key={record.id_record} className="border-border hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">
                      {format(new Date(record.record_date), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell className="text-sm">{record.line_name}</TableCell>
                    <TableCell className="text-sm">{record.equipment_name}</TableCell>
                    <TableCell className="text-sm">{record.shift_name}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {(record.availability_ratio * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {(record.performance_ratio * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {(record.quality_ratio * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {(record.oee_total * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getOeeBandColor(record.oee_total)}>
                        {record.oee_band_es}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DataSourceBadge
                        source={record.source}
                        integrationName={record.integration_name}
                        lastSync={record.last_sync}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex">
                              {record.validated ? (
                                <CheckCircle className="h-5 w-5 text-status-good" />
                              ) : (
                                <XCircle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover border-border">
                            <p className="text-xs">
                              {record.validated ? "Validado por supervisor" : "Pendiente de validación"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.last_sync || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Mock data generator
function generateMockRecords(count: number): OeeHistoryRecord[] {
  const records: OeeHistoryRecord[] = [];
  const sources: DataSource[] = ["auto", "mixed", "manual"];
  const integrations = ["SCADA System", "Production Counter", "MES Integration"];
  const lines = ["Línea de Producción A", "Línea de Producción B"];
  const equipment = ["Máquina CNC #1", "Máquina CNC #2", "Prensa Hidráulica", "Torno Automático"];
  const shifts = ["Turno Mañana", "Turno Tarde", "Turno Noche"];
  const bands = [
    { code: "excellent", es: "Excelente", min: 0.95 },
    { code: "good", es: "Bueno", min: 0.85 },
    { code: "acceptable", es: "Aceptable", min: 0.75 },
    { code: "fair", es: "Regular", min: 0.65 },
    { code: "unacceptable", es: "Inaceptable", min: 0 },
  ];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const availability = 0.70 + Math.random() * 0.25;
    const performance = 0.75 + Math.random() * 0.20;
    const quality = 0.85 + Math.random() * 0.13;
    const oee = availability * performance * quality;

    const band = bands.find(b => oee >= b.min) || bands[bands.length - 1];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const integration = source === "auto" ? integrations[Math.floor(Math.random() * integrations.length)] : undefined;

    records.push({
      id_record: 1000 + i,
      record_date: date.toISOString().split("T")[0],
      id_line: Math.floor(Math.random() * 2) + 1,
      line_name: lines[Math.floor(Math.random() * lines.length)],
      id_equipment: Math.floor(Math.random() * 4) + 1,
      equipment_name: equipment[Math.floor(Math.random() * equipment.length)],
      id_shift: Math.floor(Math.random() * 3) + 1,
      shift_name: shifts[Math.floor(Math.random() * shifts.length)],
      oee_total: oee,
      availability_ratio: availability,
      performance_ratio: performance,
      quality_ratio: quality,
      oee_band_code: band.code,
      oee_band_es: band.es,
      source,
      validated: Math.random() > 0.3,
      last_sync: source !== "manual" ? `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
      integration_name: integration,
    });
  }

  return records;
}
