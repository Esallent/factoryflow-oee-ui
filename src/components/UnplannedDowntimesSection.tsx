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
import { Plus, Trash2, PlusCircle } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export interface UnplannedDowntime {
  id: string;
  category_code: string;
  category_name: string;
  duration_min: number;
  cause_detail?: string;
}

interface UnplannedDowntimesSectionProps {
  downtimes: UnplannedDowntime[];
  onChange: (downtimes: UnplannedDowntime[]) => void;
  shiftDurationMin: number;
}

interface DowntimeCategory {
  code: string;
  name: string;
}

// Mock downtime categories from unified catalog - replace with API call
const initialCategories: DowntimeCategory[] = [
  { code: "MATERIAL", name: "Material Shortage" },
  { code: "QUALITY", name: "Quality Issue" },
  { code: "ELECTRICAL", name: "Electrical Failure" },
  { code: "MECHANICAL", name: "Mechanical Failure" },
];

export function UnplannedDowntimesSection({
  downtimes,
  onChange,
  shiftDurationMin,
}: UnplannedDowntimesSectionProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<DowntimeCategory[]>(initialCategories);
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const [newCategoryCode, setNewCategoryCode] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const addDowntime = () => {
    const newDowntime: UnplannedDowntime = {
      id: `dt-${Date.now()}`,
      category_code: "",
      category_name: "",
      duration_min: 0,
      cause_detail: "",
    };
    onChange([...downtimes, newDowntime]);
  };

  const handleAddNewCategory = () => {
    if (newCategoryCode && newCategoryName) {
      const newCategory = {
        code: newCategoryCode.toUpperCase(),
        name: newCategoryName,
      };
      setCategories([...categories, newCategory]);
      setNewCategoryCode("");
      setNewCategoryName("");
      setNewCategoryDialogOpen(false);
    }
  };

  const removeDowntime = (id: string) => {
    onChange(downtimes.filter((dt) => dt.id !== id));
  };

  const updateDowntime = (id: string, field: keyof UnplannedDowntime, value: any) => {
    const updated = downtimes.map((dt) => {
      if (dt.id === id) {
        if (field === "category_code") {
          const category = categories.find(c => c.code === value);
          return { 
            ...dt, 
            category_code: value,
            category_name: category?.name || ""
          };
        }
        return { ...dt, [field]: value };
      }
      return dt;
    });
    onChange(updated);
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
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t("downtime_category")} *
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={downtime.category_code}
                          onValueChange={(value) =>
                            updateDowntime(downtime.id, "category_code", value)
                          }
                        >
                          <SelectTrigger className="bg-card border-border flex-1">
                            <SelectValue placeholder={t("select_or_create")} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border z-[100]">
                            {categories.map((cat) => (
                              <SelectItem key={cat.code} value={cat.code}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setNewCategoryDialogOpen(true)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t("duration_minutes")} *
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
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

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDowntime(downtime.id)}
                        className="hover:bg-destructive/10 hover:text-destructive w-full md:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("cause_detail")}
                    </label>
                    <Textarea
                      value={downtime.cause_detail || ""}
                      onChange={(e) =>
                        updateDowntime(downtime.id, "cause_detail", e.target.value)
                      }
                      className="bg-card border-border resize-none"
                      rows={2}
                      placeholder={t("optional_details")}
                    />
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

      <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{t("add_new_category")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-code">{t("category_code")} *</Label>
              <Input
                id="category-code"
                placeholder="e.g., ELECTRICAL"
                value={newCategoryCode}
                onChange={(e) => setNewCategoryCode(e.target.value)}
                className="bg-sidebar border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-name">{t("category_name")} *</Label>
              <Input
                id="category-name"
                placeholder="e.g., Electrical Failure"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-sidebar border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewCategoryDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleAddNewCategory}
              disabled={!newCategoryCode || !newCategoryName}
            >
              {t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
