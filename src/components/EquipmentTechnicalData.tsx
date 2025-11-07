import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

interface EquipmentTechnicalDataProps {
  data: {
    line: string;
    equipment: string;
    cycleTime: string;
    shiftDuration: string;
    theoreticalCapacityHour: string;
    theoreticalCapacityShift: string;
    plannedDowntime: string;
    unplannedDowntime: string;
  };
}

export function EquipmentTechnicalData({ data }: EquipmentTechnicalDataProps) {
  const fields = [
    { label: "Línea", value: data.line },
    { label: "Equipo", value: data.equipment },
    { label: "Ciclo", value: data.cycleTime },
    { label: "Turno", value: data.shiftDuration },
    { label: "Capacidad teórica", value: data.theoreticalCapacityHour },
    { label: "Capacidad teórica por turno", value: data.theoreticalCapacityShift },
    { label: "Paradas planificadas", value: data.plannedDowntime },
    { label: "Paradas no planificadas", value: data.unplannedDowntime },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Datos del equipo</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map((field, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">{field.label}</p>
              <p className="font-semibold text-foreground">{field.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
