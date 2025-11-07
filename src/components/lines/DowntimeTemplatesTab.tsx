import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DowntimeTemplateDialog } from "./DowntimeTemplateDialog";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export interface DowntimeTemplate {
  id: string;
  name: string;
  duration_min: number;
  unit_type: "ABSOLUTE" | "UNIT_PER_CYCLE";
  remarks?: string;
  equipment_id?: string;
  line_id?: string;
}

interface DowntimeTemplatesTabProps {
  selectedEquipmentId?: string;
  selectedLineId?: string;
}

// Mock data - replace with API call to /equipment/{id}/downtime-templates
const mockTemplates: DowntimeTemplate[] = [
  {
    id: "dt-1",
    name: "Lunch Break",
    duration_min: 30,
    unit_type: "ABSOLUTE",
    remarks: "Daily lunch break for operators",
  },
  {
    id: "dt-2",
    name: "Tool Change",
    duration_min: 5,
    unit_type: "UNIT_PER_CYCLE",
    remarks: "Tool change every cycle",
  },
];

export function DowntimeTemplatesTab({ selectedEquipmentId, selectedLineId }: DowntimeTemplatesTabProps) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<DowntimeTemplate[]>(mockTemplates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DowntimeTemplate | null>(null);

  const columns = [
    {
      header: t("template_name"),
      accessor: (template: DowntimeTemplate) => (
        <span className="font-medium">{template.name}</span>
      ),
    },
    {
      header: t("duration"),
      accessor: (template: DowntimeTemplate) => (
        <span>{template.duration_min} min</span>
      ),
    },
    {
      header: t("unit_type"),
      accessor: (template: DowntimeTemplate) => (
        <span className="text-sm">
          {template.unit_type === "ABSOLUTE" ? t("unit_type_absolute") : t("unit_type_per_cycle")}
        </span>
      ),
    },
    {
      header: t("remarks"),
      accessor: (template: DowntimeTemplate) => (
        <span className="text-muted-foreground text-sm">{template.remarks || "—"}</span>
      ),
    },
    {
      header: "",
      accessor: (template: DowntimeTemplate) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(template)}
            className="hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(template.id)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (template: DowntimeTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // DELETE /equipment/{equipmentId}/downtime-templates/{id}
      // await fetch(`/api/v1/equipment/${selectedEquipmentId}/downtime-templates/${id}`, {
      //   method: 'DELETE',
      // });

      setTemplates(templates.filter((t) => t.id !== id));
      
      toast({
        title: t("success"),
        description: t("delete_template"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error_occurred"),
        description: "Failed to delete template",
      });
    }
  };

  const handleSave = async (data: Omit<DowntimeTemplate, "id">) => {
    try {
      if (editingTemplate) {
        // PUT /equipment/{equipmentId}/downtime-templates/{id}
        // await fetch(`/api/v1/equipment/${selectedEquipmentId}/downtime-templates/${editingTemplate.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });

        setTemplates(
          templates.map((t) =>
            t.id === editingTemplate.id ? { ...data, id: t.id } : t
          )
        );
      } else {
        // POST /equipment/{equipmentId}/downtime-templates
        // await fetch(`/api/v1/equipment/${selectedEquipmentId}/downtime-templates`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     ...data,
        //     equipment_id: selectedEquipmentId,
        //     line_id: selectedLineId,
        //   }),
        // });

        const newTemplate = {
          ...data,
          id: `dt-${Date.now()}`,
          equipment_id: selectedEquipmentId,
          line_id: selectedLineId,
        };

        setTemplates([...templates, newTemplate]);
      }

      toast({
        title: t("success"),
        description: editingTemplate ? t("edit_template") : t("add_template"),
      });

      setDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error_occurred"),
        description: "Failed to save template",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-sm text-muted-foreground">
          {t("template_helper")}
        </AlertDescription>
      </Alert>

      {!selectedEquipmentId && (
        <Alert className="bg-yellow-500/10 border-yellow-500/30">
          <Info className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-sm">
            {t("select_equipment_to_manage_templates")}
          </AlertDescription>
        </Alert>
      )}

      {selectedEquipmentId && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t("downtime_templates")}</h2>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("add_template")}
            </Button>
          </div>

          <DataTable
            data={templates}
            columns={columns}
            emptyMessage={t("no_templates")}
          />

          <DowntimeTemplateDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            template={editingTemplate}
            onSave={handleSave}
          />
        </>
      )}
    </div>
  );
}
