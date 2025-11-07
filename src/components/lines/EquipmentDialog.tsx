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
import { ScrollArea } from "@/components/ui/scroll-area";
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

const formSchema = z.object({
  equipment_code: z.string().min(1, "Equipment code is required").max(50),
  equipment_name: z.string().min(1, "Equipment name is required").max(200),
  design_cycle_time_min: z
    .number()
    .min(0.1, "Design cycle time must be at least 0.1 minutes")
    .max(1440, "Design cycle time cannot exceed 1440 minutes"),
  active_flag: z.boolean(),
  associated_template_ids: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Equipment {
  id: string;
  equipment_code: string;
  equipment_name: string;
  design_cycle_time_min: number;
  active_flag: boolean;
  associated_template_ids?: string[];
}

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSave: (data: Omit<Equipment, "id">) => void;
  availableTemplates: Array<{ id: string; name: string }>;
}

export function EquipmentDialog({
  open,
  onOpenChange,
  equipment,
  onSave,
  availableTemplates,
}: EquipmentDialogProps) {
  const { t } = useTranslation();
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipment_code: "",
      equipment_name: "",
      design_cycle_time_min: 1.0,
      active_flag: true,
      associated_template_ids: [],
    },
  });

  useEffect(() => {
    if (equipment) {
      form.reset({
        equipment_code: equipment.equipment_code,
        equipment_name: equipment.equipment_name,
        design_cycle_time_min: equipment.design_cycle_time_min,
        active_flag: equipment.active_flag,
        associated_template_ids: equipment.associated_template_ids || [],
      });
      setSelectedTemplates(equipment.associated_template_ids || []);
    } else {
      form.reset({
        equipment_code: "",
        equipment_name: "",
        design_cycle_time_min: 1.0,
        active_flag: true,
        associated_template_ids: [],
      });
      setSelectedTemplates([]);
    }
  }, [equipment, form]);

  const toggleTemplate = (templateId: string) => {
    const newSelection = selectedTemplates.includes(templateId)
      ? selectedTemplates.filter(id => id !== templateId)
      : [...selectedTemplates, templateId];
    setSelectedTemplates(newSelection);
    form.setValue("associated_template_ids", newSelection);
  };

  const onSubmit = (data: FormValues) => {
    onSave({
      equipment_code: data.equipment_code,
      equipment_name: data.equipment_name,
      design_cycle_time_min: data.design_cycle_time_min,
      active_flag: data.active_flag,
      associated_template_ids: selectedTemplates,
    });
    form.reset();
    setSelectedTemplates([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {equipment ? t("edit") + " " + t("select_equipment") : t("add_equipment")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    Minimum value: 0.1 minutes
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

            {/* Templates Association */}
            <div className="space-y-2">
              <FormLabel>{t("associated_templates")}</FormLabel>
              <div className="border border-border rounded-lg p-3 bg-sidebar">
                {availableTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    {t("no_templates")}
                  </p>
                ) : (
                  <ScrollArea className="h-[120px]">
                    <div className="space-y-2">
                      {availableTemplates.map((template) => (
                        <div key={template.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={template.id}
                            checked={selectedTemplates.includes(template.id)}
                            onCheckedChange={() => toggleTemplate(template.id)}
                          />
                          <label
                            htmlFor={template.id}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {template.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedTemplates.length} {t("template_plural")} {t("equipment_selected")}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
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
      </DialogContent>
    </Dialog>
  );
}
