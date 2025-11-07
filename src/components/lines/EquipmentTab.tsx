import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Link2, Clock } from "lucide-react";
import { EquipmentDialog } from "./EquipmentDialog";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";

interface PlannedDowntime {
  id: string;
  category_code: string;
  category_name: string;
  duration_min: number;
  unit_type: "absolute" | "per_cycle";
}

interface Equipment {
  id: string;
  equipment_code: string;
  equipment_name: string;
  design_cycle_time_min: number;
  active_flag: boolean;
  planned_downtimes?: PlannedDowntime[];
  assigned_line_id?: string;
  assigned_line_name?: string;
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
    assigned_line_id: "line-1",
    assigned_line_name: "Production Line A",
    planned_downtimes: [
      { id: "1", category_code: "MAINT", category_name: "Maintenance", duration_min: 30, unit_type: "absolute" },
      { id: "3", category_code: "BREAK", category_name: "Break", duration_min: 15, unit_type: "absolute" },
    ],
  },
  { 
    id: "eq-2", 
    equipment_code: "CNC-002", 
    equipment_name: "CNC Machine #2", 
    design_cycle_time_min: 3.0, 
    active_flag: true,
    assigned_line_id: "line-1",
    assigned_line_name: "Production Line A",
    planned_downtimes: [
      { id: "2", category_code: "SETUP", category_name: "Setup/Changeover", duration_min: 45, unit_type: "absolute" },
    ],
  },
  { 
    id: "eq-3", 
    equipment_code: "RBT-001", 
    equipment_name: "Robotic Arm #1", 
    design_cycle_time_min: 1.8, 
    active_flag: false,
    planned_downtimes: [],
  },
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

  const selectedEquipmentDetails = equipment.find((eq) => eq.id === selectedEquipment);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{t("equipment")}</h2>
          <p className="text-sm text-muted-foreground">{t("equipment_management_subtitle")}</p>
        </div>
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

      <Card className="p-4 bg-card border-border">
        <DataTable
          data={equipment}
          columns={columns}
          emptyMessage={t("no_equipment")}
          onRowClick={handleRowClick}
          selectedRowId={selectedEquipment}
        />
      </Card>

      {selectedEquipmentDetails && (
        <Card className="p-6 bg-card border-border">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("equipment_details")}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("equipment_code")}</p>
                    <p className="font-mono font-medium">{selectedEquipmentDetails.equipment_code}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">{t("equipment_name")}</p>
                    <p className="font-medium">{selectedEquipmentDetails.equipment_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">{t("cycle_time")}</p>
                    <p className="font-medium">{selectedEquipmentDetails.design_cycle_time_min} min</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">{t("status")}</p>
                    <Badge variant={selectedEquipmentDetails.active_flag ? "default" : "secondary"}>
                      {selectedEquipmentDetails.active_flag ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      {t("assigned_line")}
                    </p>
                    {selectedEquipmentDetails.assigned_line_id ? (
                      <div className="bg-sidebar rounded-lg p-3 border border-border">
                        <p className="font-medium">{selectedEquipmentDetails.assigned_line_name}</p>
                        <p className="text-sm text-muted-foreground">ID: {selectedEquipmentDetails.assigned_line_id}</p>
                      </div>
                    ) : (
                      <div className="bg-sidebar rounded-lg p-3 border border-border border-dashed">
                        <p className="text-sm text-muted-foreground">{t("not_assigned_to_line")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5" />
                <h4 className="text-base font-semibold">{t("planned_downtimes")}</h4>
              </div>
              
              {selectedEquipmentDetails.planned_downtimes && selectedEquipmentDetails.planned_downtimes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedEquipmentDetails.planned_downtimes.map((downtime) => (
                    <div
                      key={downtime.id}
                      className="bg-sidebar rounded-lg p-4 border border-border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-mono text-sm font-medium">{downtime.category_code}</p>
                        <Badge variant="outline" className="text-xs">
                          {downtime.unit_type === "absolute" ? t("absolute") : t("per_cycle")}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{downtime.category_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {downtime.duration_min} min
                        {downtime.unit_type === "per_cycle" && ` / ${t("cycle")}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-sidebar rounded-lg p-6 border border-border border-dashed text-center">
                  <p className="text-sm text-muted-foreground">{t("no_planned_downtimes_assigned")}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <EquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipment={editingEquipment}
        onSave={handleSave}
      />
    </div>
  );
}
