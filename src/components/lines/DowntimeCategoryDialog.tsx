import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  category_code: z.string().min(1, "Category code is required").max(50),
  category_name: z.string().min(1, "Category name is required").max(200),
  downtime_type: z.enum(["planned", "unplanned"]),
  duration_min: z.number().optional(),
  unit_type: z.enum(["absolute", "per_cycle"]).optional(),
  active_flag: z.boolean(),
  remarks: z.string().optional(),
}).refine((data) => {
  if (data.downtime_type === "planned") {
    return data.duration_min !== undefined && data.duration_min > 0 && data.unit_type !== undefined;
  }
  return true;
}, {
  message: "Duration and unit type are required for planned downtimes",
  path: ["duration_min"],
});

type FormValues = z.infer<typeof formSchema>;

interface DowntimeCategory {
  id: string;
  category_code: string;
  category_name: string;
  downtime_type: "planned" | "unplanned";
  duration_min?: number;
  unit_type?: "absolute" | "per_cycle";
  active_flag: boolean;
  remarks?: string;
}

interface DowntimeCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: DowntimeCategory | null;
  onSave: (data: Omit<DowntimeCategory, "id">) => void;
}

export function DowntimeCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: DowntimeCategoryDialogProps) {
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_code: "",
      category_name: "",
      downtime_type: "unplanned",
      duration_min: undefined,
      unit_type: "absolute",
      active_flag: true,
      remarks: "",
    },
  });

  const downtimeType = form.watch("downtime_type");

  useEffect(() => {
    if (category) {
      form.reset({
        category_code: category.category_code,
        category_name: category.category_name,
        downtime_type: category.downtime_type,
        duration_min: category.duration_min,
        unit_type: category.unit_type || "absolute",
        active_flag: category.active_flag,
        remarks: category.remarks || "",
      });
    } else {
      form.reset({
        category_code: "",
        category_name: "",
        downtime_type: "unplanned",
        duration_min: undefined,
        unit_type: "absolute",
        active_flag: true,
        remarks: "",
      });
    }
  }, [category, form]);

  const onSubmit = (data: FormValues) => {
    const payload: Omit<DowntimeCategory, "id"> = {
      category_code: data.category_code,
      category_name: data.category_name,
      downtime_type: data.downtime_type,
      active_flag: data.active_flag,
      remarks: data.remarks,
    };

    if (data.downtime_type === "planned") {
      payload.duration_min = data.duration_min;
      payload.unit_type = data.unit_type;
    }

    onSave(payload);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {category ? t("edit") + " " + t("category") : t("add_category")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="downtime_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("downtime_type")} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-sidebar border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border z-50">
                      <SelectItem value="planned">{t("planned")}</SelectItem>
                      <SelectItem value="unplanned">{t("unplanned")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("downtime_type_description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category_code")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., MAINT"
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
                name="category_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category_name")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Maintenance"
                        className="bg-sidebar border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {downtimeType === "planned" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("duration")} (min) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="e.g., 30"
                          className="bg-sidebar border-border"
                          {...field}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            field.onChange(isNaN(val) ? undefined : val);
                          }}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit_type")} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-sidebar border-border">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border z-50">
                          <SelectItem value="absolute">{t("unit_type_absolute")}</SelectItem>
                          <SelectItem value="per_cycle">{t("unit_type_per_cycle")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("remarks")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("optional_remarks")}
                      className="bg-sidebar border-border resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
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
