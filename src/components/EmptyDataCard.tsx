import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, RefreshCw } from 'lucide-react';

interface EmptyDataCardProps {
  title?: string;
  message?: string;
  type?: 'no-data' | 'incomplete' | 'error';
  onRetry?: () => void;
  showRetry?: boolean;
}

export function EmptyDataCard({ 
  title = 'Sin datos disponibles',
  message = 'No hay datos para mostrar con los filtros seleccionados.',
  type = 'no-data',
  onRetry,
  showRetry = false,
}: EmptyDataCardProps) {
  const configs = {
    'no-data': {
      icon: Database,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted/30',
      borderColor: 'border-muted',
    },
    'incomplete': {
      icon: AlertTriangle,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
    },
    'error': {
      icon: AlertTriangle,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card className={`p-8 text-center ${config.bgColor} ${config.borderColor}`}>
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full ${config.bgColor}`}>
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{message}</p>
        </div>
        {showRetry && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        )}
        {type === 'incomplete' && (
          <div className="flex items-center gap-2 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            <span>Lectura automática pendiente</span>
          </div>
        )}
      </div>
    </Card>
  );
}
