import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Filters {
  id_line?: string;
  id_equipment?: string;
  id_shift?: string;
  from_date?: Date;
  to_date?: Date;
}

interface OeeRecord {
  id: string;
  date: Date;
  line: string;
  equipment: string;
  availability_ratio: number;
  performance_ratio: number;
  quality_ratio: number;
  oee_total: number;
  total_units: number;
  defective_units: number;
  source: string;
}

interface OeeHistoryTableProps {
  filters: Filters;
}

// Mock data generator
const generateMockData = (): OeeRecord[] => {
  const records: OeeRecord[] = [];
  const lines = ["Production Line A", "Production Line B"];
  const equipment = ["CNC Machine #1", "CNC Machine #2", "Robotic Arm #1"];
  const sources = ["manual", "api", "automated"];

  for (let i = 0; i < 125; i++) {
    const availability = 0.7 + Math.random() * 0.25;
    const performance = 0.65 + Math.random() * 0.3;
    const quality = 0.85 + Math.random() * 0.14;
    const oee = availability * performance * quality;

    records.push({
      id: `rec-${i + 1}`,
      date: new Date(2025, 0, Math.floor(i / 5) + 1, 8 + (i % 3) * 8),
      line: lines[i % lines.length],
      equipment: equipment[i % equipment.length],
      availability_ratio: availability,
      performance_ratio: performance,
      quality_ratio: quality,
      oee_total: oee,
      total_units: Math.floor(200 + Math.random() * 300),
      defective_units: Math.floor(Math.random() * 20),
      source: sources[i % sources.length],
    });
  }

  return records;
};

const ROWS_PER_PAGE = 50;

export function OeeHistoryTable({ filters }: OeeHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch data (mock)
  const allRecords = generateMockData();
  
  // Apply filters
  const filteredRecords = allRecords.filter((record) => {
    if (filters.id_line && !record.line.includes(filters.id_line)) return false;
    if (filters.id_equipment && !record.equipment.includes(filters.id_equipment)) return false;
    if (filters.from_date && record.date < filters.from_date) return false;
    if (filters.to_date && record.date > filters.to_date) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const getOeeBadgeColor = (oee: number) => {
    if (oee >= 0.85) return "bg-[#27ae60]";
    if (oee >= 0.75) return "bg-[#2ecc71]";
    if (oee >= 0.60) return "bg-[#f1c40f] text-foreground";
    if (oee >= 0.40) return "bg-[#f39c12]";
    return "bg-[#e74c3c]";
  };

  const getSourceBadge = (source: string) => {
    const variants: Record<string, string> = {
      manual: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      api: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      automated: "bg-green-500/10 text-green-400 border-green-500/20",
    };
    return variants[source] || "bg-muted";
  };

  if (currentRecords.length === 0) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <p className="text-muted-foreground">
          No production records found. Try adjusting your filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Line</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Equipment</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Availability</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Performance</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Quality</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">OEE</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Total Units</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Defective</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.map((record) => (
                <TableRow key={record.id} className="border-border hover:bg-sidebar-accent/50">
                  <TableCell className="font-mono text-sm">
                    {format(record.date, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell>{record.line}</TableCell>
                  <TableCell>{record.equipment}</TableCell>
                  <TableCell className="text-right font-mono">
                    {(record.availability_ratio * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(record.performance_ratio * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(record.quality_ratio * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={`${getOeeBadgeColor(record.oee_total)} font-mono`}>
                      {(record.oee_total * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {record.total_units.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {record.defective_units}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSourceBadge(record.source)}>
                      {record.source}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of{" "}
          {filteredRecords.length} records
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
