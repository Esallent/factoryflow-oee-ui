import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wrench } from "lucide-react";

interface EquipmentSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  equipment?: { id: string; name: string }[];
  disabled?: boolean;
}

export function EquipmentSelector({ 
  value, 
  onValueChange, 
  equipment = [],
  disabled = false 
}: EquipmentSelectorProps) {
  // Mock data for demonstration
  const mockEquipment = equipment.length > 0 ? equipment : [
    { id: "eq-1", name: "CNC Machine #1" },
    { id: "eq-2", name: "CNC Machine #2" },
    { id: "eq-3", name: "Robotic Arm #1" },
    { id: "eq-4", name: "Assembly Station A" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Wrench className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-[240px] bg-card border-border">
          <SelectValue placeholder="Select equipment" />
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
  );
}
