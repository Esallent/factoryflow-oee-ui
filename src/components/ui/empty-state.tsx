import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title = "No Data Available",
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center bg-sidebar/30 border-border">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  );
}
