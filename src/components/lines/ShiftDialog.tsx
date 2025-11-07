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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/contexts/LanguageContext";

const shiftSchema = z.object({
  name: z.string().min(1, "Shift name is required"),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  is_active: z.boolean(),
});

type ShiftFormValues = z.infer<typeof shiftSchema>;

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShiftFormValues) => void;
  initialData?: {
    name: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
  };
}

export function ShiftDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ShiftDialogProps) {
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: initialData || {
      name: "",
      start_time: "08:00",
      end_time: "16:00",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  const handleFormSubmit = (data: ShiftFormValues) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t("edit_shift") : t("add_shift")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("shift_name")} *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("shift_name_placeholder")}
              className="bg-sidebar border-border"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">{t("start_time")} *</Label>
              <Input
                id="start_time"
                type="time"
                {...register("start_time")}
                className="bg-sidebar border-border"
              />
              {errors.start_time && (
                <p className="text-sm text-destructive">{errors.start_time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">{t("end_time")} *</Label>
              <Input
                id="end_time"
                type="time"
                {...register("end_time")}
                className="bg-sidebar border-border"
              />
              {errors.end_time && (
                <p className="text-sm text-destructive">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-sidebar rounded-lg">
            <div>
              <Label htmlFor="is_active" className="cursor-pointer">
                {t("active_status")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("shift_active_description")}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">
              {initialData ? t("save") : t("add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
