import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShiftDialog } from "./ShiftDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  line_id?: string;
  is_active: boolean;
}

interface ShiftsTabProps {
  selectedLineId?: string;
}

// Mock shifts data
const initialShifts: Shift[] = [
  { id: "shift-1", name: "Morning Shift", start_time: "06:00", end_time: "14:00", is_active: true },
  { id: "shift-2", name: "Afternoon Shift", start_time: "14:00", end_time: "22:00", is_active: true },
  { id: "shift-3", name: "Night Shift", start_time: "22:00", end_time: "06:00", is_active: true },
];

export function ShiftsTab({ selectedLineId }: ShiftsTabProps) {
  const { t } = useTranslation();
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  const handleAddShift = (shift: Omit<Shift, "id">) => {
    const newShift: Shift = {
      ...shift,
      id: `shift-${Date.now()}`,
      line_id: selectedLineId,
    };
    setShifts([...shifts, newShift]);
    setDialogOpen(false);
    toast({
      title: t("success"),
      description: t("add_success"),
    });
  };

  const handleEditShift = (shift: Omit<Shift, "id">) => {
    if (!editingShift) return;
    
    setShifts(shifts.map(s => 
      s.id === editingShift.id 
        ? { ...shift, id: editingShift.id, line_id: selectedLineId }
        : s
    ));
    setEditingShift(null);
    setDialogOpen(false);
    toast({
      title: t("success"),
      description: t("edit_success"),
    });
  };

  const handleDeleteShift = () => {
    if (!shiftToDelete) return;
    
    setShifts(shifts.filter(s => s.id !== shiftToDelete));
    setShiftToDelete(null);
    setDeleteDialogOpen(false);
    toast({
      title: t("success"),
      description: t("delete_success"),
    });
  };

  const openEditDialog = (shift: Shift) => {
    setEditingShift(shift);
    setDialogOpen(true);
  };

  const openDeleteDialog = (shiftId: string) => {
    setShiftToDelete(shiftId);
    setDeleteDialogOpen(true);
  };

  const filteredShifts = selectedLineId 
    ? shifts.filter(s => s.line_id === selectedLineId || !s.line_id)
    : shifts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t("shifts_configuration")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("shifts_configuration_subtitle")}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingShift(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("add_shift")}
        </Button>
      </div>

      {selectedLineId && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {t("configuring_shifts_for_line")}
          </p>
        </div>
      )}

      {filteredShifts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">{t("no_shifts_configured")}</p>
          <Button
            onClick={() => {
              setEditingShift(null);
              setDialogOpen(true);
            }}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("add_first_shift")}
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-sidebar hover:bg-sidebar">
                <TableHead>{t("shift_name")}</TableHead>
                <TableHead>{t("start_time")}</TableHead>
                <TableHead>{t("end_time")}</TableHead>
                <TableHead>{t("shift_duration")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.map((shift) => {
                const calculateDuration = (start: string, end: string) => {
                  const [startHour, startMin] = start.split(":").map(Number);
                  const [endHour, endMin] = end.split(":").map(Number);
                  let duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                  if (duration < 0) duration += 24 * 60; // Handle overnight shifts
                  return `${Math.floor(duration / 60)}h ${duration % 60}m`;
                };

                return (
                  <TableRow key={shift.id}>
                    <TableCell className="font-medium">{shift.name}</TableCell>
                    <TableCell>{shift.start_time}</TableCell>
                    <TableCell>{shift.end_time}</TableCell>
                    <TableCell>{calculateDuration(shift.start_time, shift.end_time)}</TableCell>
                    <TableCell>
                      <Badge variant={shift.is_active ? "default" : "secondary"}>
                        {shift.is_active ? t("active") : t("inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(shift)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(shift.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ShiftDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingShift ? handleEditShift : handleAddShift}
        initialData={editingShift || undefined}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_shift_confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShift}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
