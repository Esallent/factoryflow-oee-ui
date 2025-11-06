import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { EquipmentDialog } from "./EquipmentDialog";
import { toast } from "@/hooks/use-toast";

interface Equipment {
  id: string;
  equipment_code: string;
  equipment_name: string;
  design_cycle_time_min: number;
  active_flag: boolean;
}

interface EquipmentTabProps {
  selectedLineId: string;
}

// Mock data - replace with API call
const mockEquipment: Equipment[] = [
  {
    id: "1",
    equipment_code: "CNC-001",
    equipment_name: "CNC Machine #1",
    design_cycle_time_min: 2.5,
    active_flag: true,
  },
  {
    id: "2",
    equipment_code: "CNC-002",
    equipment_name: "CNC Machine #2",
    design_cycle_time_min: 2.3,
    active_flag: true,
  },
  {
    id: "3",
    equipment_code: "ARM-001",
    equipment_name: "Robotic Arm #1",
    design_cycle_time_min: 1.8,
    active_flag: false,
  },
];

export function EquipmentTab({ selectedLineId }: EquipmentTabProps) {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const handleAdd = () => {
    setEditingEquipment(null);
    setDialogOpen(true);
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // await fetch(`/api/v1/equipment/${id}`, { method: 'DELETE' });
      setEquipment(equipment.filter((eq) => eq.id !== id));
      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete equipment",
      });
    }
  };

  const handleSave = (data: Omit<Equipment, "id">) => {
    if (editingEquipment) {
      // Update existing
      setEquipment(
        equipment.map((eq) =>
          eq.id === editingEquipment.id ? { ...data, id: eq.id } : eq
        )
      );
      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });
    } else {
      // Add new
      setEquipment([...equipment, { ...data, id: Date.now().toString() }]);
      toast({
        title: "Success",
        description: "Equipment added successfully",
      });
    }
    setDialogOpen(false);
  };

  const columns = [
    {
      header: "Equipment Code",
      accessor: "equipment_code" as keyof Equipment,
    },
    {
      header: "Equipment Name",
      accessor: "equipment_name" as keyof Equipment,
    },
    {
      header: "Design Cycle Time (min)",
      accessor: "design_cycle_time_min" as keyof Equipment,
    },
    {
      header: "Status",
      accessor: ((row: Equipment) => (
        <Badge className={row.active_flag ? "bg-status-good" : "bg-status-offline"}>
          {row.active_flag ? "Active" : "Inactive"}
        </Badge>
      )) as any,
    },
    {
      header: "Actions",
      accessor: ((row: Equipment) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )) as any,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Equipment Management</h2>
          <p className="text-sm text-muted-foreground">
            {selectedLineId
              ? `Managing equipment for line: ${selectedLineId}`
              : "Select a line from the General tab to manage its equipment"}
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      <DataTable
        data={equipment}
        columns={columns}
        emptyMessage="No equipment configured. Add your first equipment to get started."
      />

      <EquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipment={editingEquipment}
        onSave={handleSave}
      />
    </div>
  );
}
