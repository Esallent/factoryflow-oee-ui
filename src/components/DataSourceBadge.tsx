import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CircleCheck, AlertTriangle, Circle } from "lucide-react";

type DataSource = "auto" | "mixed" | "manual";

interface DataSourceBadgeProps {
  source: DataSource;
  integrationName?: string;
  lastSync?: string;
  className?: string;
}

export function DataSourceBadge({ source, integrationName, lastSync, className }: DataSourceBadgeProps) {
  const getBadgeConfig = () => {
    switch (source) {
      case "auto":
        return {
          icon: <CircleCheck className="h-3 w-3" />,
          label: "AUTO",
          variant: "default" as const,
          className: "bg-status-good text-white hover:bg-status-good/90",
          tooltip: integrationName && lastSync
            ? `Valor recibido automáticamente de ${integrationName} a las ${lastSync}`
            : "Valor automático del sistema",
        };
      case "mixed":
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          label: "MIXED",
          variant: "default" as const,
          className: "bg-status-warning text-warning-foreground hover:bg-status-warning/90",
          tooltip: "Valor parcialmente automático y manual",
        };
      case "manual":
        return {
          icon: <Circle className="h-3 w-3" />,
          label: "MANUAL",
          variant: "outline" as const,
          className: "border-muted-foreground/30 text-muted-foreground",
          tooltip: "Valor ingresado manualmente",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className={`gap-1 text-xs ${config.className} ${className}`}>
            {config.icon}
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover border-border">
          <p className="text-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
