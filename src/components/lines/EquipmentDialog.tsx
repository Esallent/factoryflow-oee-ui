import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useTranslation } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlannedDowntime {
  id: string;
  category_code: string;
  category_name: string;
  duration_min: number;
  unit_type: "absolute" | "per_cycle";
}

const formSchema = z.object({
  equipment_code: z.string().min(1, "Equipment code is required").max(50),
  equipment_name: z.string().min(1, "Equipment name is required").max(200),
  design_cycle_time_min: z
    .number()
    .min(0.1, "Design cycle time must be at least 0.1 minutes")
    .max(1440, "Design cycle time cannot exceed 1440 minutes"),
  active_flag: z.boolean(),
  planned_downtime_ids: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface Equipment {
  id: string;
  equipment_code: string;
  equipment_name: string;
  design_cycle_time_min: number;
  active_flag: boolean;
  planned_downtimes?: PlannedDowntime[];
}

// Mock planned downtimes - replace with actual API call
const availablePlannedDowntimes: PlannedDowntime[] = [
  { id: "1", category_code: "MAINT", category_name: "Maintenance", duration_min: 30, unit_type: "absolute" },
  { id: "2", category_code: "SETUP", category_name: "Setup/Changeover", duration_min: 45, unit_type: "absolute" },
  { id: "3", category_code: "BREAK", category_name: "Break", duration_min: 15, unit_type: "absolute" },
  { id: "4", category_code: "CLEAN", category_name: "Cleaning", duration_min: 20, unit_type: "absolute" },
  { id: "5", category_code: "INSP", category_name: "Inspection", duration_min: 10, unit_type: "per_cycle" },
];

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSave: (data: Omit<Equipment, "id">) => void;
}

export function EquipmentDialog({
  open,
  onOpenChange,
  equipment,
  onSave,
}: EquipmentDialogProps) {
  const { t } = useTranslation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipment_code: "",
      equipment_name: "",
      design_cycle_time_min: 1.0,
      active_flag: true,
      planned_downtime_ids: [],
    },
  });

  useEffect(() => {
    if (equipment) {
      form.reset({
        equipment_code: equipment.equipment_code,
        equipment_name: equipment.equipment_name,
        design_cycle_time_min: equipment.design_cycle_time_min,
        active_flag: equipment.active_flag,
        planned_downtime_ids: equipment.planned_downtimes?.map((dt) => dt.id) || [],
      });
    } else {
      form.reset({
        equipment_code: "",
        equipment_name: "",
        design_cycle_time_min: 1.0,
        active_flag: true,
        planned_downtime_ids: [],
      });
    }
  }, [equipment, form]);

  const onSubmit = (data: FormValues) => {
    onSave({
      equipment_code: data.equipment_code,
      equipment_name: data.equipment_name,
      design_cycle_time_min: data.design_cycle_time_min,
      active_flag: data.active_flag,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {equipment ? t("edit") + " " + t("equipment") : t("add_equipment")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="equipment_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("equipment_code")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., CNC-001"
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
                  name="equipment_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("equipment_name")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., CNC Machine #1"
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
                  name="design_cycle_time_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("cycle_time")} *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="e.g., 2.5"
                          className="bg-sidebar border-border"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("cycle_time_description")}
                      </FormDescription>
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
                        <FormDescription>
                          {t("toggle_description")}
                        </FormDescription>
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

              <div className="border-t border-border pt-6">
                <FormField
                  control={form.control}
                  name="planned_downtime_ids"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">{t("assign_planned_downtimes")}</FormLabel>
                        <FormDescription>
                          {t("select_planned_downtimes_description")}
                        </FormDescription>
                      </div>
                      <div className="space-y-3">
                        {availablePlannedDowntimes.map((downtime) => (
                          <FormField
                            key={downtime.id}
                            control={form.control}
                            name="planned_downtime_ids"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={downtime.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border bg-sidebar p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(downtime.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, downtime.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== downtime.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <FormLabel className="font-mono text-sm font-medium">
                                        {downtime.category_code}
                                      </FormLabel>
                                      <Badge variant="outline" className="text-xs">
                                        {downtime.unit_type === "absolute" ? t("absolute") : t("per_cycle")}
                                      </Badge>
                                    </div>
                                    <p className="text-sm">{downtime.category_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {downtime.duration_min} min
                                      {downtime.unit_type === "per_cycle" && ` / ${t("cycle")}`}
                                    </p>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit">
                  {t("save")}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
