import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/LanguageContext";
import { UnplannedDowntimeCategoryDialog } from "./UnplannedDowntimeCategoryDialog";
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

interface UnplannedDowntimeCategory {
  id: string;
  category_code: string;
  category_name: string;
  active_flag: boolean;
}

export function UnplannedDowntimeCategoriesTab() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<UnplannedDowntimeCategory[]>([
    { id: "1", category_code: "MAINT", category_name: "Maintenance", active_flag: true },
    { id: "2", category_code: "SETUP", category_name: "Setup/Changeover", active_flag: true },
    { id: "3", category_code: "BREAK", category_name: "Break", active_flag: true },
    { id: "4", category_code: "MATERIAL", category_name: "Material Shortage", active_flag: true },
    { id: "5", category_code: "QUALITY", category_name: "Quality Issue", active_flag: true },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UnplannedDowntimeCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<UnplannedDowntimeCategory | null>(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: UnplannedDowntimeCategory) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: UnplannedDowntimeCategory) => {
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

  const handleSave = (data: Omit<UnplannedDowntimeCategory, "id">) => {
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
      const newCategory: UnplannedDowntimeCategory = {
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

  const columns = [
    {
      header: t("category_code"),
      accessor: (row: UnplannedDowntimeCategory) => (
        <span className="font-mono font-medium">{row.category_code}</span>
      ),
    },
    {
      header: t("category_name"),
      accessor: (row: UnplannedDowntimeCategory) => row.category_name,
    },
    {
      header: t("status"),
      accessor: (row: UnplannedDowntimeCategory) => (
        <Badge variant={row.active_flag ? "default" : "secondary"}>
          {row.active_flag ? t("active") : t("inactive")}
        </Badge>
      ),
    },
    {
      header: t("actions"),
      accessor: (row: UnplannedDowntimeCategory) => (
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
          <h2 className="text-xl font-semibold">{t("unplanned_categories")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("unplanned_categories_subtitle")}
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("add_category")}
        </Button>
      </div>

      <DataTable data={categories} columns={columns} />

      <UnplannedDowntimeCategoryDialog
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
