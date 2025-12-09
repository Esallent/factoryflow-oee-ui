/**
 * FactoryOS Backend API Client
 * 
 * This file is auto-generated from the backend.
 * Run `sh scripts/update-api-client.sh` to update it.
 * 
 * The script requires VITE_API_KEY to be configured as a Lovable secret.
 */

import { API_CONFIG } from './apiConfig';
import type {
  OeeByEquipmentResponse,
  LossesCascadeResponse,
  EquipmentComparisonData,
  ShiftAggregateOee,
  HourlyOeeData,
  Plant,
  Line,
  Equipment,
  Shift,
} from '@/types/oee';

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: any = new Error(`API Error: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

// Health check
export const getHealth = async () => {
  return fetchAPI('/api/v1/health');
};

// OEE v2.0 endpoints (backward compatible)
export const calculateOEEv2 = async (data: any) => {
  return fetchAPI('/api/v2/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getRecords = async (filters: any) => {
  const params = new URLSearchParams(filters);
  return fetchAPI(`/api/v1/records?${params}`);
};

export const getIntegrationStatus = async () => {
  return fetchAPI('/integration/info');
};

export const getLossesCascade = async (filters: any) => {
  const params = new URLSearchParams(filters);
  return fetchAPI(`/api/v2/losses/cascade?${params}`);
};

// ============================================
// OEE v2.1 Endpoints - Equipment Level
// ============================================

// Get OEE data by equipment (view_oee_by_equipment)
export const getOeeByEquipment = async (filters: {
  equipment_id?: string;
  line_id?: string;
  shift_id?: string;
  start_date: string;
  end_date: string;
}): Promise<OeeByEquipmentResponse> => {
  const params = new URLSearchParams();
  if (filters.equipment_id) params.append('equipment_id', filters.equipment_id);
  if (filters.line_id) params.append('line_id', filters.line_id);
  if (filters.shift_id) params.append('shift_id', filters.shift_id);
  params.append('start_date', filters.start_date);
  params.append('end_date', filters.end_date);
  
  return fetchAPI(`/api/v2/oee/by-equipment?${params}`);
};

// Get aggregated OEE by shift (view_oee_aggregate_turno)
export const getOeeAggregateByShift = async (filters: {
  line_id?: string;
  start_date: string;
  end_date: string;
}): Promise<ShiftAggregateOee[]> => {
  const params = new URLSearchParams();
  if (filters.line_id) params.append('line_id', filters.line_id);
  params.append('start_date', filters.start_date);
  params.append('end_date', filters.end_date);
  
  return fetchAPI(`/api/v2/oee/aggregate-shift?${params}`);
};

// Get equipment comparison within line (view_oee_compare_line)
export const getEquipmentComparison = async (filters: {
  line_id: string;
  start_date: string;
  end_date: string;
}): Promise<EquipmentComparisonData[]> => {
  const params = new URLSearchParams(filters);
  return fetchAPI(`/api/v2/oee/compare-equipment?${params}`);
};

// Get losses cascade by equipment (view_losses_equipment)
export const getLossesByEquipment = async (filters: {
  equipment_id: string;
  start_date: string;
  end_date: string;
}): Promise<LossesCascadeResponse> => {
  const params = new URLSearchParams(filters);
  return fetchAPI(`/api/v2/losses/by-equipment?${params}`);
};

// Get hourly OEE data for equipment detail view
export const getHourlyOeeData = async (filters: {
  equipment_id: string;
  date: string;
}): Promise<HourlyOeeData[]> => {
  const params = new URLSearchParams(filters);
  return fetchAPI(`/api/v2/oee/hourly?${params}`);
};

// ============================================
// Hierarchy Endpoints
// ============================================

// Get all plants
export const getPlants = async (): Promise<Plant[]> => {
  return fetchAPI('/api/v2/hierarchy/plants');
};

// Get lines by plant
export const getLinesByPlant = async (plantId: string): Promise<Line[]> => {
  return fetchAPI(`/api/v2/hierarchy/plants/${plantId}/lines`);
};

// Get equipment by line
export const getEquipmentByLine = async (lineId: string): Promise<Equipment[]> => {
  return fetchAPI(`/api/v2/hierarchy/lines/${lineId}/equipment`);
};

// Get all shifts
export const getShifts = async (): Promise<Shift[]> => {
  return fetchAPI('/api/v2/hierarchy/shifts');
};

// ============================================
// Reports Endpoints
// ============================================

// Export OEE daily report as CSV
export const exportOeeDailyCsv = async (filters: {
  equipment_id?: string;
  line_id?: string;
  start_date: string;
  end_date: string;
}): Promise<Blob> => {
  const params = new URLSearchParams();
  if (filters.equipment_id) params.append('equipment_id', filters.equipment_id);
  if (filters.line_id) params.append('line_id', filters.line_id);
  params.append('start_date', filters.start_date);
  params.append('end_date', filters.end_date);
  
  const url = `${API_CONFIG.baseUrl}/reports/oee-daily.csv?${params}`;
  const response = await fetch(url, {
    headers: API_CONFIG.headers,
  });
  
  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }
  
  return response.blob();
};
