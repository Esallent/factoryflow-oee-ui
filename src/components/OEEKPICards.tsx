import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, CheckCircle2, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "@/contexts/LanguageContext";

interface OEEMetrics {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  band: string;
  band_color: string;
}

interface OEEKPICardsProps {
  metrics: OEEMetrics | null;
}

export function OEEKPICards({ metrics }: OEEKPICardsProps) {
  const { t } = useTranslation();
  
  if (!metrics) {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-sidebar/50 border-border text-center">
          <p className="text-muted-foreground">
            {t('calculate')}
          </p>
        </Card>
      </div>
    );
  }

  const kpiData = [
    {
      label: t('availability'),
      value: metrics.availability,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      tooltip: "Availability = Operating Time / Planned Production Time",
    },
    {
      label: t('performance'),
      value: metrics.performance,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      tooltip: "Performance = (Ideal Cycle Time × Total Count) / Operating Time",
    },
    {
      label: t('quality'),
      value: metrics.quality,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      tooltip: "Quality = Good Count / Total Count",
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Tooltip key={kpi.label}>
              <TooltipTrigger asChild>
                <Card className="p-4 bg-sidebar border-border hover:border-primary/30 transition-colors cursor-help">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                        <Icon className={`h-5 w-5 ${kpi.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{kpi.label}</p>
                        <p className="text-2xl font-bold">{kpi.value.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{kpi.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* OEE Card with Band Color */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className="p-6 border-2 transition-all cursor-help"
              style={{
                borderColor: metrics.band_color,
                backgroundColor: `${metrics.band_color}15`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${metrics.band_color}20` }}
                  >
                    <Target className="h-6 w-6" style={{ color: metrics.band_color }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Equipment Effectiveness</p>
                    <p className="text-4xl font-bold" style={{ color: metrics.band_color }}>
                      {metrics.oee.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Performance Band</span>
                  <span
                    className="text-sm font-bold uppercase tracking-wide px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${metrics.band_color}30`,
                      color: metrics.band_color,
                    }}
                  >
                    {metrics.band}
                  </span>
                </div>
              </div>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">OEE = Availability × Performance × Quality</p>
          </TooltipContent>
        </Tooltip>

      {/* Band Legend */}
      <Card className="p-4 bg-sidebar/30 border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-3">OEE Performance Bands</p>
        <div className="space-y-2">
          {[
            { label: "Excellence", color: "#27ae60", range: "≥ 85%" },
            { label: "Good", color: "#2ecc71", range: "75-84%" },
            { label: "Acceptable", color: "#f1c40f", range: "60-74%" },
            { label: "Fair", color: "#f39c12", range: "40-59%" },
            { label: "Unacceptable", color: "#e74c3c", range: "< 40%" },
          ].map((band) => (
            <div key={band.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: band.color }}
                />
                <span className="text-muted-foreground">{band.label}</span>
              </div>
              <span className="text-muted-foreground font-mono">{band.range}</span>
            </div>
          ))}
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
