import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export interface UnplannedDowntime {
  id: string;
  category_code: string;
  duration_min: number;
  cause_detail?: string;
}

interface UnplannedDowntimesSectionProps {
  downtimes: UnplannedDowntime[];
  onChange: (downtimes: UnplannedDowntime[]) => void;
  shiftDurationMin: number;
}

// Mock downtime categories - replace with API call to /dim_downtime
const downtimeCategories = [
  { code: "MAINT", name: "Maintenance" },
  { code: "SETUP", name: "Setup/Changeover" },
  { code: "BREAK", name: "Break" },
  { code: "MATERIAL", name: "Material Shortage" },
  { code: "QUALITY", name: "Quality Issue" },
  { code: "OTRO", name: "Other" },
];

export function UnplannedDowntimesSection({
  downtimes,
  onChange,
  shiftDurationMin,
}: UnplannedDowntimesSectionProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const addDowntime = () => {
    const newDowntime: UnplannedDowntime = {
      id: `dt-${Date.now()}`,
      category_code: "",
      duration_min: 0,
      cause_detail: "",
    };
    onChange([...downtimes, newDowntime]);
  };

  const removeDowntime = (id: string) => {
    onChange(downtimes.filter((dt) => dt.id !== id));
  };

  const updateDowntime = (id: string, field: keyof UnplannedDowntime, value: any) => {
    onChange(
      downtimes.map((dt) =>
        dt.id === id ? { ...dt, [field]: value } : dt
      )
    );
  };

  const totalDuration = downtimes.reduce((sum, dt) => sum + (dt.duration_min || 0), 0);
  const exceedsLimit = totalDuration > shiftDurationMin;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-6 bg-card border-border">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{t("unplanned_downtimes")}</h2>
              {downtimes.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({downtimes.length} {downtimes.length === 1 ? "entry" : "entries"})
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 animate-accordion-down">
          <div className="space-y-4">
            {downtimes.map((downtime, index) => (
              <Card key={downtime.id} className="p-4 bg-sidebar border-border">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-4">
                    <label className="text-sm font-medium mb-2 block">
                      {t("downtime_category")} *
                    </label>
                    <Select
                      value={downtime.category_code}
                      onValueChange={(value) =>
                        updateDowntime(downtime.id, "category_code", value)
                      }
                    >
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder={t("category_required")} />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border z-50">
                        {downtimeCategories.map((cat) => (
                          <SelectItem key={cat.code} value={cat.code}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">
                      {t("duration")} *
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={downtime.duration_min || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                          updateDowntime(downtime.id, "duration_min", val);
                        }
                      }}
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="text-sm font-medium mb-2 block">
                      {t("cause_detail")}
                      {downtime.category_code === "OTRO" && " *"}
                    </label>
                    <Textarea
                      value={downtime.cause_detail || ""}
                      onChange={(e) =>
                        updateDowntime(downtime.id, "cause_detail", e.target.value)
                      }
                      className="bg-card border-border resize-none"
                      rows={1}
                      placeholder={
                        downtime.category_code === "OTRO"
                          ? t("cause_detail_required")
                          : t("cause_detail")
                      }
                    />
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDowntime(downtime.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={addDowntime}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("add_downtime")}
              </Button>

              {downtimes.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">{t("downtime")}:</span>{" "}
                  <span className={exceedsLimit ? "text-destructive font-semibold" : "font-semibold"}>
                    {totalDuration.toFixed(1)} min
                  </span>
                  {exceedsLimit && (
                    <span className="text-destructive ml-2">
                      ({t("total_downtime_exceeds")})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
