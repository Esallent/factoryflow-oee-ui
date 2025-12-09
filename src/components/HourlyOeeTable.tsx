import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, AlertTriangle } from 'lucide-react';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { getOeeBandColor } from '@/types/oee';
import type { HourlyOeeData } from '@/types/oee';

interface HourlyOeeTableProps {
  data: HourlyOeeData[];
  isLoading: boolean;
}

export function HourlyOeeTable({ data, isLoading }: HourlyOeeTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No hay datos horarios disponibles</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Tabla Horaria</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Métricas OEE desglosadas por hora
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Hora</TableHead>
              <TableHead className="text-muted-foreground text-right">Unidades</TableHead>
              <TableHead className="text-muted-foreground text-right">Defectos</TableHead>
              <TableHead className="text-muted-foreground text-right">TF</TableHead>
              <TableHead className="text-muted-foreground text-right">TP</TableHead>
              <TableHead className="text-muted-foreground text-right">TO</TableHead>
              <TableHead className="text-muted-foreground text-right">TNO</TableHead>
              <TableHead className="text-muted-foreground text-right">TNV</TableHead>
              <TableHead className="text-muted-foreground text-right">OEE</TableHead>
              <TableHead className="text-muted-foreground text-center">Origen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const oeePercent = row.oee * 100;
              const oeeColor = getOeeBandColor(row.oee);
              
              return (
                <TableRow key={row.hour} className="border-border hover:bg-muted/30">
                  <TableCell className="font-medium">{row.hour}</TableCell>
                  <TableCell className="text-right">{row.units_produced.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={row.defective_units > 0 ? 'text-destructive' : ''}>
                      {row.defective_units}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.tf_min}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.tp_min}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.to_min}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.tno_min}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.tnv_min.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <span 
                      className="font-bold px-2 py-1 rounded"
                      style={{ 
                        color: oeeColor,
                        backgroundColor: `${oeeColor}20`
                      }}
                    >
                      {oeePercent.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DataSourceBadge source={row.data_source} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary Row */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Total: {data.reduce((sum, r) => sum + r.units_produced, 0).toLocaleString()} unidades
          </span>
          <span className="text-muted-foreground">
            Defectos: {data.reduce((sum, r) => sum + r.defective_units, 0)}
          </span>
          <span className="font-medium">
            OEE Promedio:{' '}
            <span style={{ color: getOeeBandColor(data.reduce((sum, r) => sum + r.oee, 0) / data.length) }}>
              {((data.reduce((sum, r) => sum + r.oee, 0) / data.length) * 100).toFixed(1)}%
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}
