import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const formSchema = z.object({
  equipment_code: z.string().min(1, "Equipment code is required").max(50),
  equipment_name: z.string().min(1, "Equipment name is required").max(200),
  design_cycle_time_min: z
    .number()
    .min(0.1, "Design cycle time must be at least 0.1 minutes")
    .max(1440, "Design cycle time cannot exceed 1440 minutes"),
  active_flag: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface Equipment {
  id: string;
  equipment_code: string;
  equipment_name: string;
  design_cycle_time_min: number;
  active_flag: boolean;
}

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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipment_code: "",
      equipment_name: "",
      design_cycle_time_min: 1.0,
      active_flag: true,
    },
  });

  useEffect(() => {
    if (equipment) {
      form.reset({
        equipment_code: equipment.equipment_code,
        equipment_name: equipment.equipment_name,
        design_cycle_time_min: equipment.design_cycle_time_min,
        active_flag: equipment.active_flag,
      });
    } else {
      form.reset({
        equipment_code: "",
        equipment_name: "",
        design_cycle_time_min: 1.0,
        active_flag: true,
      });
    }
  }, [equipment, form, open]);

  const onSubmit = (data: FormValues) => {
    onSave({
      equipment_code: data.equipment_code,
      equipment_name: data.equipment_name,
      design_cycle_time_min: data.design_cycle_time_min,
      active_flag: data.active_flag,
    });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {equipment ? "Edit Equipment" : "Add New Equipment"}
          </DialogTitle>
          <DialogDescription>
            {equipment
              ? "Update the equipment details below"
              : "Fill in the equipment details below"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="equipment_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Code *</FormLabel>
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
                  <FormLabel>Equipment Name *</FormLabel>
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
                  <FormLabel>Design Cycle Time (minutes) *</FormLabel>
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
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this equipment
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {equipment ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
