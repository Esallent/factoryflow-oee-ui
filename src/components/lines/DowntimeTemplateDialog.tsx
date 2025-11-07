import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/contexts/LanguageContext";
import { DowntimeTemplate } from "./DowntimeTemplatesTab";

const formSchema = z.object({
  name: z.string().min(1, "template_name_required").max(200),
  duration_min: z.number().min(0, "duration_invalid"),
  unit_type: z.enum(["ABSOLUTE", "UNIT_PER_CYCLE"], {
    required_error: "unit_type_required",
  }),
  remarks: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DowntimeTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: DowntimeTemplate | null;
  onSave: (data: Omit<DowntimeTemplate, "id">) => void;
}

export function DowntimeTemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: DowntimeTemplateDialogProps) {
  const { t } = useTranslation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      duration_min: 0,
      unit_type: "ABSOLUTE",
      remarks: "",
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        duration_min: template.duration_min,
        unit_type: template.unit_type,
        remarks: template.remarks || "",
      });
    } else {
      form.reset({
        name: "",
        duration_min: 0,
        unit_type: "ABSOLUTE",
        remarks: "",
      });
    }
  }, [template, form]);

  const onSubmit = (data: FormValues) => {
    const templateData: Omit<DowntimeTemplate, "id"> = {
      name: data.name,
      duration_min: data.duration_min,
      unit_type: data.unit_type,
      remarks: data.remarks,
    };
    onSave(templateData);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {template ? t("edit_template") : t("add_template")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("template_name")} *</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-sidebar border-border"
                      placeholder={t("template_name")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("duration")} *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        className="bg-sidebar border-border"
                        {...field}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                            field.onChange(val);
                          }
                        }}
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
                        <SelectItem value="ABSOLUTE">
                          {t("unit_type_absolute")}
                        </SelectItem>
                        <SelectItem value="UNIT_PER_CYCLE">
                          {t("unit_type_per_cycle")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("remarks")}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-sidebar border-border resize-none"
                      rows={3}
                      placeholder={t("remarks")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">{t("save")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
