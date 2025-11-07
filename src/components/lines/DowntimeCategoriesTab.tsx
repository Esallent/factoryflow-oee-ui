import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/LanguageContext";
import { DowntimeCategoryDialog } from "./DowntimeCategoryDialog";
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
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function DowntimeCategoriesTab() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<DowntimeCategory[]>([
    { id: "1", category_code: "MAINT", category_name: "Maintenance", downtime_type: "planned", duration_min: 30, unit_type: "absolute", active_flag: true },
    { id: "2", category_code: "SETUP", category_name: "Setup/Changeover", downtime_type: "planned", duration_min: 45, unit_type: "absolute", active_flag: true },
    { id: "3", category_code: "BREAK", category_name: "Break", downtime_type: "planned", duration_min: 15, unit_type: "absolute", active_flag: true },
    { id: "4", category_code: "MATERIAL", category_name: "Material Shortage", downtime_type: "unplanned", active_flag: true },
    { id: "5", category_code: "QUALITY", category_name: "Quality Issue", downtime_type: "unplanned", active_flag: true },
    { id: "6", category_code: "ELECTRICAL", category_name: "Electrical Failure", downtime_type: "unplanned", active_flag: true },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DowntimeCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<DowntimeCategory | null>(null);
  const [filterType, setFilterType] = useState<"all" | "planned" | "unplanned">("all");

  const handleAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: DowntimeCategory) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: DowntimeCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      toast({
        title: t("success"),
        description: t("delete_success"),
      });
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = (data: Omit<DowntimeCategory, "id">) => {
    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? { ...c, ...data } : c
        )
      );
      toast({
        title: t("success"),
        description: t("edit_success"),
      });
    } else {
      const newCategory: DowntimeCategory = {
        id: `cat-${Date.now()}`,
        ...data,
      };
      setCategories([...categories, newCategory]);
      toast({
        title: t("success"),
        description: t("add_success"),
      });
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (filterType === "all") return true;
    return cat.downtime_type === filterType;
  });

  const columns = [
    {
      header: t("category_code"),
      accessor: (row: DowntimeCategory) => (
        <span className="font-mono font-medium">{row.category_code}</span>
      ),
    },
    {
      header: t("category_name"),
      accessor: (row: DowntimeCategory) => row.category_name,
    },
    {
      header: t("downtime_type"),
      accessor: (row: DowntimeCategory) => (
        <Badge variant={row.downtime_type === "planned" ? "default" : "secondary"}>
          {row.downtime_type === "planned" ? t("planned") : t("unplanned")}
        </Badge>
      ),
    },
    {
      header: t("duration"),
      accessor: (row: DowntimeCategory) => {
        if (row.downtime_type === "unplanned") {
          return <span className="text-muted-foreground text-sm">{t("not_applicable")}</span>;
        }
        return (
          <div className="flex items-center gap-1">
            <span>{row.duration_min} min</span>
            {row.unit_type === "per_cycle" && (
              <span className="text-xs text-muted-foreground">/{t("cycle")}</span>
            )}
          </div>
        );
      },
    },
    {
      header: t("status"),
      accessor: (row: DowntimeCategory) => (
        <Badge variant={row.active_flag ? "default" : "secondary"}>
          {row.active_flag ? t("active") : t("inactive")}
        </Badge>
      ),
    },
    {
      header: t("actions"),
      accessor: (row: DowntimeCategory) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{t("downtime_categories")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("downtime_categories_subtitle")}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-[180px] bg-sidebar border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">{t("all_types")}</SelectItem>
              <SelectItem value="planned">{t("planned")}</SelectItem>
              <SelectItem value="unplanned">{t("unplanned")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("add_category")}
          </Button>
        </div>
      </div>

      <DataTable data={filteredCategories} columns={columns} emptyMessage={t("no_categories")} />

      <DowntimeCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_category_confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
