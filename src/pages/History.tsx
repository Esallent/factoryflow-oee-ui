import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductionRecord {
  id: string;
  date: string;
  line: string;
  equipment: string;
  shift: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

const mockData: ProductionRecord[] = [
  {
    id: "1",
    date: "2025-11-06",
    line: "Line A",
    equipment: "CNC #1",
    shift: "Morning",
    oee: 85.2,
    availability: 92.5,
    performance: 91.0,
    quality: 98.5,
  },
  {
    id: "2",
    date: "2025-11-06",
    line: "Line A",
    equipment: "CNC #1",
    shift: "Afternoon",
    oee: 78.5,
    availability: 88.0,
    performance: 87.5,
    quality: 96.8,
  },
  {
    id: "3",
    date: "2025-11-05",
    line: "Line B",
    equipment: "Robot #1",
    shift: "Morning",
    oee: 82.1,
    availability: 90.0,
    performance: 89.0,
    quality: 97.2,
  },
];

const getOEEBadge = (oee: number) => {
  if (oee >= 85) return <Badge className="bg-status-good">Excellent</Badge>;
  if (oee >= 75) return <Badge className="bg-status-warning">Good</Badge>;
  return <Badge className="bg-status-critical">Needs Improvement</Badge>;
};

const History = () => {
  const columns = [
    { header: "Date", accessor: "date" as const },
    { header: "Line", accessor: "line" as const },
    { header: "Equipment", accessor: "equipment" as const },
    { header: "Shift", accessor: "shift" as const },
    { 
      header: "OEE", 
      accessor: (row: ProductionRecord) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold tabular-nums">{row.oee}%</span>
          {getOEEBadge(row.oee)}
        </div>
      )
    },
    { 
      header: "Availability", 
      accessor: (row: ProductionRecord) => (
        <span className="tabular-nums">{row.availability}%</span>
      )
    },
    { 
      header: "Performance", 
      accessor: (row: ProductionRecord) => (
        <span className="tabular-nums">{row.performance}%</span>
      )
    },
    { 
      header: "Quality", 
      accessor: (row: ProductionRecord) => (
        <span className="tabular-nums">{row.quality}%</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Production History</h1>
          <p className="text-muted-foreground">
            Historical OEE records and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-metric-bg border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average OEE (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">81.9%</p>
            <p className="text-xs text-muted-foreground mt-1">↑ 2.3% vs last week</p>
          </CardContent>
        </Card>

        <Card className="bg-metric-bg border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">156</p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-metric-bg border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Performing Line
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Line A</p>
            <p className="text-xs text-muted-foreground mt-1">85.2% average OEE</p>
          </CardContent>
        </Card>
      </div>

      <DataTable 
        data={mockData} 
        columns={columns}
        emptyMessage="No production records found. Start recording data to see history."
      />
    </div>
  );
};

export default History;
