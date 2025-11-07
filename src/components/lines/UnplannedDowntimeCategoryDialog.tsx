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
  active_flag: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface UnplannedDowntimeCategory {
  id: string;
  category_code: string;
  category_name: string;
  active_flag: boolean;
}

interface UnplannedDowntimeCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: UnplannedDowntimeCategory | null;
  onSave: (data: Omit<UnplannedDowntimeCategory, "id">) => void;
}

export function UnplannedDowntimeCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: UnplannedDowntimeCategoryDialogProps) {
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_code: "",
      category_name: "",
      active_flag: true,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        category_code: category.category_code,
        category_name: category.category_name,
        active_flag: category.active_flag,
      });
    } else {
      form.reset({
        category_code: "",
        category_name: "",
        active_flag: true,
      });
    }
  }, [category, form]);

  const onSubmit = (data: FormValues) => {
    onSave({
      category_code: data.category_code,
      category_name: data.category_name,
      active_flag: data.active_flag,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category ? t("edit") + " " + t("category") : t("add_category")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("category_code")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., ELECTRICAL"
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
                      placeholder="e.g., Electrical Failure"
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
