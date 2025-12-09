/**
 * OEE 2.1 Type Definitions
 * Types for equipment-level OEE metrics and aggregations
 */

// Data source types
export type DataSource = 'manual' | 'auto' | 'mixed';

// Base OEE metrics interface
export interface OeeMetrics {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

// Equipment-level daily OEE data (view_oee_by_equipment)
export interface EquipmentOeeData extends OeeMetrics {
  record_date: string;
  equipment_id: string;
  equipment_name: string;
  line_id: string;
  line_name: string;
  shift_id?: string;
  shift_name?: string;
  total_units: number;
  defective_units: number;
  expected_units: number;
  tf_min: number;  // Tiempo de turno
  tp_min: number;  // Tiempo planificado
  to_min: number;  // Tiempo operativo
  tno_min: number; // Tiempo neto operativo
  tnv_min: number; // Tiempo de valor neto
  cycle_time_min: number;
  data_source: DataSource;
  oee_weighted?: number; // OEE × TO for aggregation
}

// Weighted OEE aggregate by shift (view_oee_aggregate_turno)
export interface ShiftAggregateOee extends OeeMetrics {
  shift_id: string;
  shift_name: string;
  line_id: string;
  line_name: string;
  record_date: string;
  total_to_min: number;  // Sum of operating time
  oee_weighted: number;  // Weighted OEE (OEE × TO / Total TO)
  equipment_count: number;
}

// Equipment comparison within line (view_oee_compare_line)
export interface EquipmentComparisonData extends OeeMetrics {
  equipment_id: string;
  equipment_name: string;
  line_id: string;
  line_name: string;
  rank: number;
  oee_delta_vs_line_avg: number; // % difference vs line average
  to_min: number;
  total_units: number;
}

// Losses cascade by equipment (view_losses_equipment)
export interface EquipmentLossesData {
  equipment_id: string;
  equipment_name: string;
  record_date: string;
  tf_min: number;
  planned_loss_min: number;
  planned_loss_pct: number;
  unplanned_loss_min: number;
  unplanned_loss_pct: number;
  performance_loss_min: number;
  performance_loss_pct: number;
  quality_loss_min: number;
  quality_loss_pct: number;
  tnv_min: number;
  tnv_pct: number;
  loss_categories: LossCategory[];
}

export interface LossCategory {
  code: string;
  name: string;
  type: 'planned' | 'unplanned' | 'performance' | 'quality';
  duration_min: number;
  pct_of_tf: number;
}

// Hourly data for equipment detail view
export interface HourlyOeeData extends OeeMetrics {
  hour: string;
  equipment_id: string;
  units_produced: number;
  defective_units: number;
  tf_min: number;
  tp_min: number;
  to_min: number;
  tno_min: number;
  tnv_min: number;
  data_source: DataSource;
}

// Plant/Line/Equipment hierarchy
export interface Plant {
  id: string;
  name: string;
  lines: Line[];
}

export interface Line {
  id: string;
  name: string;
  plant_id: string;
  equipment: Equipment[];
}

export interface Equipment {
  id: string;
  name: string;
  line_id: string;
  cycle_time_min: number;
  is_active: boolean;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

// Filter types for OEE 2.1
export interface OeeFiltersV21 {
  plant_id?: string;
  line_id?: string;
  equipment_id?: string;
  shift_id?: string;
  start_date: string;
  end_date: string;
  compare_equipment_id?: string;
}

// API Response types
export interface OeeByEquipmentResponse {
  data: EquipmentOeeData[];
  meta: {
    total_records: number;
    date_range: { start: string; end: string };
  };
}

export interface LossesCascadeResponse {
  data: EquipmentLossesData[];
  aggregated: {
    total_tf_min: number;
    total_tnv_min: number;
    avg_oee: number;
  };
}

// OEE Band helpers
export type OeeBand = 'excellence' | 'good' | 'acceptable' | 'fair' | 'unacceptable';

export function getOeeBand(oee: number): OeeBand {
  if (oee >= 0.95) return 'excellence';
  if (oee >= 0.85) return 'good';
  if (oee >= 0.75) return 'acceptable';
  if (oee >= 0.65) return 'fair';
  return 'unacceptable';
}

export function getOeeBandColor(oee: number): string {
  const band = getOeeBand(oee);
  const colors: Record<OeeBand, string> = {
    excellence: 'hsl(142, 76%, 36%)',
    good: 'hsl(142, 71%, 45%)',
    acceptable: 'hsl(217, 91%, 60%)',
    fair: 'hsl(38, 92%, 50%)',
    unacceptable: 'hsl(0, 72%, 51%)',
  };
  return colors[band];
}

export function getDataSourceLabel(source: DataSource): string {
  const labels: Record<DataSource, string> = {
    manual: 'Manual',
    auto: 'Automático',
    mixed: 'Mixto',
  };
  return labels[source];
}
