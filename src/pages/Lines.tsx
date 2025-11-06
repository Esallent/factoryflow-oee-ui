import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Line {
  id: string;
  name: string;
  status: "active" | "inactive" | "maintenance";
  equipmentCount: number;
}

interface Equipment {
  id: string;
  name: string;
  lineId: string;
  status: "operational" | "offline" | "maintenance";
  lastMaintenance: string;
}

const mockLines: Line[] = [
  { id: "1", name: "Production Line A", status: "active", equipmentCount: 4 },
  { id: "2", name: "Production Line B", status: "active", equipmentCount: 3 },
  { id: "3", name: "Assembly Line 1", status: "maintenance", equipmentCount: 5 },
];

const mockEquipment: Equipment[] = [
  { id: "1", name: "CNC Machine #1", lineId: "1", status: "operational", lastMaintenance: "2025-10-15" },
  { id: "2", name: "CNC Machine #2", lineId: "1", status: "operational", lastMaintenance: "2025-10-20" },
  { id: "3", name: "Robotic Arm #1", lineId: "1", status: "offline", lastMaintenance: "2025-09-30" },
  { id: "4", name: "Assembly Station A", lineId: "2", status: "operational", lastMaintenance: "2025-11-01" },
];

const getStatusBadge = (status: string) => {
  const styles = {
    active: "bg-status-good",
    operational: "bg-status-good",
    inactive: "bg-status-offline",
    offline: "bg-status-critical",
    maintenance: "bg-status-warning",
  };
  return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
};

const Lines = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lines & Equipment</h1>
          <p className="text-muted-foreground">
            Manage production lines and equipment configuration
          </p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add New Line
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Production Lines</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockLines.map((line) => (
              <Card key={line.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{line.name}</CardTitle>
                  {getStatusBadge(line.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    {line.equipmentCount} equipment units
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings2 className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Equipment</h2>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </div>
          <div className="grid gap-4">
            {mockEquipment.map((equipment) => (
              <Card key={equipment.id} className="bg-card border-border">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{equipment.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last maintenance: {equipment.lastMaintenance}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(equipment.status)}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings2 className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lines;
