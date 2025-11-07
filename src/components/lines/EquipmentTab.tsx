import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { EquipmentDialog } from "./EquipmentDialog";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";

interface Equipment {
  id: string;
  equipment_code: string;
  equipment_name: string;
  design_cycle_time_min: number;
  active_flag: boolean;
  associated_template_ids?: string[];
}

interface EquipmentTabProps {
  selectedLineId: string;
  onEquipmentSelect?: (equipmentId: string) => void;
}

// Mock data - replace with actual API calls
const mockEquipment: Equipment[] = [
  { 
    id: "eq-1", 
    equipment_code: "CNC-001", 
    equipment_name: "CNC Machine #1", 
    design_cycle_time_min: 2.5, 
    active_flag: true,
    associated_template_ids: ["dt-1", "dt-2"],
  },
  { 
    id: "eq-2", 
    equipment_code: "CNC-002", 
    equipment_name: "CNC Machine #2", 
    design_cycle_time_min: 3.0, 
    active_flag: true,
    associated_template_ids: ["dt-1"],
  },
  { 
    id: "eq-3", 
    equipment_code: "RBT-001", 
    equipment_name: "Robotic Arm #1", 
    design_cycle_time_min: 1.8, 
    active_flag: false,
    associated_template_ids: [],
  },
];

// Mock templates - replace with actual API call
const mockTemplates = [
  { id: "dt-1", name: "Lunch Break" },
  { id: "dt-2", name: "Tool Change" },
  { id: "dt-3", name: "Maintenance Check" },
];

export function EquipmentTab({ selectedLineId, onEquipmentSelect }: EquipmentTabProps) {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");

  const handleRowClick = (eq: Equipment) => {
    setSelectedEquipment(eq.id);
    onEquipmentSelect?.(eq.id);
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // DELETE /api/v1/equipment/{id}
      setEquipment(equipment.filter((eq) => eq.id !== id));
      
      toast({
        title: t("success"),
        description: t("delete"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error_occurred"),
        description: "Failed to delete equipment",
      });
    }
  };

  const handleSave = async (data: Omit<Equipment, "id">) => {
    try {
      if (editingEquipment) {
        // PUT /api/v1/equipment/{id}
        setEquipment(
          equipment.map((eq) =>
            eq.id === editingEquipment.id ? { ...data, id: eq.id } : eq
          )
        );
      } else {
        // POST /api/v1/equipment
        const newEquipment = {
          ...data,
          id: `eq-${Date.now()}`,
        };
        setEquipment([...equipment, newEquipment]);
      }

      toast({
        title: t("success"),
        description: editingEquipment ? t("edit") : t("add"),
      });

      setDialogOpen(false);
      setEditingEquipment(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error_occurred"),
        description: "Failed to save equipment",
      });
    }
  };

  const columns = [
    {
      header: "Code",
      accessor: (eq: Equipment) => (
        <span className="font-mono text-sm">{eq.equipment_code}</span>
      ),
    },
    {
      header: "Equipment Name",
      accessor: (eq: Equipment) => (
        <span className="font-medium">{eq.equipment_name}</span>
      ),
    },
    {
      header: "Cycle Time",
      accessor: (eq: Equipment) => (
        <span className="text-sm">{eq.design_cycle_time_min} min</span>
      ),
    },
    {
      header: t("downtime_templates"),
      accessor: (eq: Equipment) => {
        const count = eq.associated_template_ids?.length || 0;
        return (
          <Badge variant={count > 0 ? "default" : "secondary"} className="text-xs">
            {count} {count === 1 ? t("template_singular") : t("template_plural")}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      accessor: (eq: Equipment) => (
        <Badge variant={eq.active_flag ? "default" : "secondary"}>
          {eq.active_flag ? t("active") : t("inactive")}
        </Badge>
      ),
    },
    {
      header: "",
      accessor: (eq: Equipment) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(eq);
            }}
            className="hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(eq.id);
            }}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("select_equipment")}</h2>
        <Button
          onClick={() => {
            setEditingEquipment(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("add_equipment")}
        </Button>
      </div>

      <DataTable
        data={equipment}
        columns={columns}
        emptyMessage="No equipment configured. Add your first equipment to get started."
        onRowClick={handleRowClick}
        selectedRowId={selectedEquipment}
      />

      <EquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipment={editingEquipment}
        onSave={handleSave}
        availableTemplates={mockTemplates}
      />
    </div>
  );
}
