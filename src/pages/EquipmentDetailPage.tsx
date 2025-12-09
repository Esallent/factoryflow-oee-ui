import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wrench, 
  Workflow, 
  Calendar, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Target,
  Download,
  RefreshCw
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { useTranslation } from '@/contexts/LanguageContext';
import { OeeTrendChart } from '@/components/OeeTrendChart';
import { EquipmentLossesCascade } from '@/components/EquipmentLossesCascade';
import { HourlyOeeTable } from '@/components/HourlyOeeTable';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { WeightedOeeBadge } from '@/components/WeightedOeeBadge';
import { EmptyDataCard } from '@/components/EmptyDataCard';
import { getOeeBandColor, getOeeBand } from '@/types/oee';
import type { EquipmentOeeData, EquipmentLossesData, HourlyOeeData, DataSource } from '@/types/oee';

// Mock data generators for demonstration
function generateMockEquipmentData(days: number): EquipmentOeeData[] {
  const data: EquipmentOeeData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const availability = 0.80 + Math.random() * 0.15;
    const performance = 0.75 + Math.random() * 0.20;
    const quality = 0.90 + Math.random() * 0.08;
    const oee = availability * performance * quality;
    const tf = 480;
    const to = tf * availability * 0.9;
    
    data.push({
      record_date: format(date, 'yyyy-MM-dd'),
      equipment_id: 'eq-1',
      equipment_name: 'CNC Machine #1',
      line_id: 'line-1',
      line_name: 'Línea de Producción A',
      shift_id: 'shift-1',
      shift_name: 'Turno Mañana',
      availability,
      performance,
      quality,
      oee,
      total_units: Math.floor(1800 + Math.random() * 400),
      defective_units: Math.floor(15 + Math.random() * 30),
      expected_units: 2000,
      tf_min: tf,
      tp_min: tf * 0.95,
      to_min: to,
      tno_min: to * performance,
      tnv_min: to * performance * quality,
      cycle_time_min: 0.25,
      data_source: ['auto', 'manual', 'mixed'][Math.floor(Math.random() * 3)] as DataSource,
      oee_weighted: oee * to,
    });
  }
  
  return data;
}

function generateMockLossesData(): EquipmentLossesData {
  const tf = 480;
  const planned = 40 + Math.random() * 20;
  const unplanned = 30 + Math.random() * 25;
  const perfLoss = 35 + Math.random() * 20;
  const qualityLoss = 10 + Math.random() * 15;
  const tnv = tf - planned - unplanned - perfLoss - qualityLoss;
  
  return {
    equipment_id: 'eq-1',
    equipment_name: 'CNC Machine #1',
    record_date: format(new Date(), 'yyyy-MM-dd'),
    tf_min: tf,
    planned_loss_min: planned,
    planned_loss_pct: (planned / tf) * 100,
    unplanned_loss_min: unplanned,
    unplanned_loss_pct: (unplanned / tf) * 100,
    performance_loss_min: perfLoss,
    performance_loss_pct: (perfLoss / tf) * 100,
    quality_loss_min: qualityLoss,
    quality_loss_pct: (qualityLoss / tf) * 100,
    tnv_min: tnv,
    tnv_pct: (tnv / tf) * 100,
    loss_categories: [
      { code: 'PM', name: 'Mant. Preventivo', type: 'planned', duration_min: planned * 0.6, pct_of_tf: (planned * 0.6 / tf) * 100 },
      { code: 'BREAK', name: 'Descansos', type: 'planned', duration_min: planned * 0.4, pct_of_tf: (planned * 0.4 / tf) * 100 },
      { code: 'FAIL', name: 'Fallas mecánicas', type: 'unplanned', duration_min: unplanned * 0.7, pct_of_tf: (unplanned * 0.7 / tf) * 100 },
      { code: 'SETUP', name: 'Setup', type: 'unplanned', duration_min: unplanned * 0.3, pct_of_tf: (unplanned * 0.3 / tf) * 100 },
    ],
  };
}

function generateMockHourlyData(): HourlyOeeData[] {
  const data: HourlyOeeData[] = [];
  
  for (let h = 6; h < 14; h++) {
    const availability = 0.85 + Math.random() * 0.12;
    const performance = 0.78 + Math.random() * 0.18;
    const quality = 0.92 + Math.random() * 0.07;
    const oee = availability * performance * quality;
    const tf = 60;
    const to = tf * availability;
    
    data.push({
      hour: `${h.toString().padStart(2, '0')}:00`,
      equipment_id: 'eq-1',
      availability,
      performance,
      quality,
      oee,
      units_produced: Math.floor(220 + Math.random() * 60),
      defective_units: Math.floor(Math.random() * 8),
      tf_min: tf,
      tp_min: Math.floor(tf * 0.95),
      to_min: Math.floor(to),
      tno_min: Math.floor(to * performance),
      tnv_min: to * performance * quality,
      data_source: ['auto', 'manual'][Math.floor(Math.random() * 2)] as DataSource,
    });
  }
  
  return data;
}

export default function EquipmentDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const equipmentId = searchParams.get('equipment_id') || 'eq-1';
  const selectedDate = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  
  const [isLoading, setIsLoading] = useState(true);
  const [dailyData, setDailyData] = useState<EquipmentOeeData[]>([]);
  const [lossesData, setLossesData] = useState<EquipmentLossesData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyOeeData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDailyData(generateMockEquipmentData(14));
      setLossesData(generateMockLossesData());
      setHourlyData(generateMockHourlyData());
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [equipmentId, selectedDate]);

  // Calculate summary from daily data
  const summary = dailyData.length > 0 ? {
    avgAvailability: dailyData.reduce((s, d) => s + d.availability, 0) / dailyData.length,
    avgPerformance: dailyData.reduce((s, d) => s + d.performance, 0) / dailyData.length,
    avgQuality: dailyData.reduce((s, d) => s + d.quality, 0) / dailyData.length,
    avgOee: dailyData.reduce((s, d) => s + d.oee, 0) / dailyData.length,
    totalUnits: dailyData.reduce((s, d) => s + d.total_units, 0),
    totalDefects: dailyData.reduce((s, d) => s + d.defective_units, 0),
    totalToMin: dailyData.reduce((s, d) => s + d.to_min, 0),
  } : null;

  // Transform daily data for trend chart
  const trendData = dailyData.map(d => ({
    calendar_date: d.record_date,
    availability_avg: d.availability,
    performance_avg: d.performance,
    quality_avg: d.quality,
    oee_avg: d.oee,
    total_units_sum: d.total_units,
    defective_units_sum: d.defective_units,
  }));

  const currentEquipment = dailyData[0];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Detalle de Equipo</h1>
          <p className="text-muted-foreground">
            Vista detallada de rendimiento OEE con análisis horario y cascada de pérdidas
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Equipment Info Header */}
      <Card className="p-6 bg-card border-border">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : currentEquipment ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Línea</p>
                  <p className="font-medium">{currentEquipment.line_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Equipo</p>
                  <p className="font-semibold text-lg">{currentEquipment.equipment_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Turno</p>
                  <p className="font-medium">{currentEquipment.shift_name || 'Todos'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ciclo</p>
                <p className="font-medium">{currentEquipment.cycle_time_min} min/ud</p>
              </div>
            </div>
            
            {/* KPI Summary Pills */}
            {summary && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">{(summary.avgAvailability * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">{(summary.avgPerformance * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">{(summary.avgQuality * 100).toFixed(1)}%</span>
                </div>
                <div 
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${getOeeBandColor(summary.avgOee)}20` }}
                >
                  <Target className="h-4 w-4" style={{ color: getOeeBandColor(summary.avgOee) }} />
                  <span 
                    className="text-lg font-bold"
                    style={{ color: getOeeBandColor(summary.avgOee) }}
                  >
                    {(summary.avgOee * 100).toFixed(1)}%
                  </span>
                </div>
                <WeightedOeeBadge oee={summary.avgOee} toMin={summary.totalToMin} />
              </div>
            )}
          </div>
        ) : (
          <EmptyDataCard type="no-data" message="No se encontró información del equipo" />
        )}
      </Card>

      {/* Trend Chart */}
      <OeeTrendChart 
        data={trendData} 
        isLoading={isLoading}
      />

      {/* Losses Cascade */}
      <EquipmentLossesCascade 
        data={lossesData} 
        isLoading={isLoading}
      />

      {/* Hourly Table */}
      <HourlyOeeTable 
        data={hourlyData} 
        isLoading={isLoading}
      />
    </div>
  );
}
