import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/LanguageContext";
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

const formSchema = z.object({
  line_code: z.string().min(1, "Line code is required").max(50),
  line_name: z.string().min(1, "Line name is required").max(200),
  active_flag: z.boolean(),
  active_equipment_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GeneralTabProps {
  onLineSelect?: (lineId: string) => void;
}

// Mock equipment data - replace with API call
const mockEquipment = [
  { id: "eq-1", name: "CNC Machine #1" },
  { id: "eq-2", name: "CNC Machine #2" },
  { id: "eq-3", name: "Robotic Arm #1" },
];

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export function GeneralTab({ onLineSelect }: GeneralTabProps) {
  const { t } = useTranslation();
  const [shifts, setShifts] = useState<Shift[]>([
    { id: "1", name: "Morning Shift", start_time: "06:00", end_time: "14:00", is_active: true },
    { id: "2", name: "Afternoon Shift", start_time: "14:00", end_time: "22:00", is_active: true },
    { id: "3", name: "Night Shift", start_time: "22:00", end_time: "06:00", is_active: true },
  ]);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line_code: "",
      line_name: "",
      active_flag: true,
      active_equipment_id: undefined,
    },
  });

  const handleAddShift = () => {
    setEditingShift(null);
    setShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftDialogOpen(true);
  };

  const handleDeleteShift = (shift: Shift) => {
    setShiftToDelete(shift);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteShift = () => {
    if (shiftToDelete) {
      setShifts(shifts.filter((s) => s.id !== shiftToDelete.id));
      toast({
        title: t("success"),
        description: t("delete_success"),
      });
      setShiftToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveShift = (data: Omit<Shift, "id">) => {
    if (editingShift) {
      setShifts(shifts.map((s) => (s.id === editingShift.id ? { ...s, ...data } : s)));
      toast({
        title: t("success"),
        description: t("edit_success"),
      });
    } else {
      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        ...data,
      };
      setShifts([...shifts, newShift]);
      toast({
        title: t("success"),
        description: t("add_success"),
      });
    }
    setShiftDialogOpen(false);
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    let duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (duration < 0) duration += 24 * 60;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const shiftColumns = [
    {
      header: t("shift_name"),
      accessor: (row: Shift) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: t("start_time"),
      accessor: (row: Shift) => row.start_time,
    },
    {
      header: t("end_time"),
      accessor: (row: Shift) => row.end_time,
    },
    {
      header: t("shift_duration"),
      accessor: (row: Shift) => calculateDuration(row.start_time, row.end_time),
    },
    {
      header: t("status"),
      accessor: (row: Shift) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? t("active") : t("inactive")}
        </Badge>
      ),
    },
    {
      header: t("actions"),
      accessor: (row: Shift) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditShift(row)}
            className="hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteShift(row)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Saving line configuration", data, "with shifts:", shifts);
      
      toast({
        title: t("success"),
        description: t("line_saved_success"),
      });
      
      if (onLineSelect && data.line_code) {
        onLineSelect(data.line_code);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("line_save_error"),
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t("line_configuration")}</h2>
        <p className="text-sm text-muted-foreground">{t("line_configuration_subtitle")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="line_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("line_code")} *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("line_code_placeholder")}
                      className="bg-sidebar border-border"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("line_name")} *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("line_name_placeholder")}
                      className="bg-sidebar border-border"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active_equipment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("active_equipment")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-sidebar border-border">
                        <SelectValue placeholder={t("select_equipment_optional")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border z-[100]">
                      {mockEquipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active_flag"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-sidebar p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("active_status")}</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {t("line_active_description")}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Shifts Section */}
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{t("shifts")}</h3>
                <p className="text-sm text-muted-foreground">{t("shifts_subtitle")}</p>
              </div>
              <Button type="button" onClick={handleAddShift} className="gap-2" variant="outline">
                <Plus className="h-4 w-4" />
                {t("add_shift")}
              </Button>
            </div>

            <DataTable 
              data={shifts} 
              columns={shiftColumns} 
              emptyMessage={t("no_shifts")} 
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {t("save_line")}
            </Button>
          </div>
        </form>
      </Form>

      <ShiftDialog
        open={shiftDialogOpen}
        onOpenChange={setShiftDialogOpen}
        onSubmit={handleSaveShift}
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
              onClick={confirmDeleteShift}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
