/**
 * OEE 2.1 React Query Hooks
 * Hooks for equipment-level OEE data fetching
 */

import { useQuery } from '@tanstack/react-query';
import {
  getOeeByEquipment,
  getOeeAggregateByShift,
  getEquipmentComparison,
  getLossesByEquipment,
  getHourlyOeeData,
  getPlants,
  getLinesByPlant,
  getEquipmentByLine,
  getShifts,
} from '@/lib/apiClient';
import type {
  EquipmentOeeData,
  ShiftAggregateOee,
  EquipmentComparisonData,
  EquipmentLossesData,
  HourlyOeeData,
  Plant,
  Line,
  Equipment,
  Shift,
} from '@/types/oee';

// ============================================
// Hierarchy Hooks
// ============================================

export const usePlants = () => {
  return useQuery<Plant[], Error>({
    queryKey: ['plants'],
    queryFn: getPlants,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useLinesByPlant = (plantId: string | undefined) => {
  return useQuery<Line[], Error>({
    queryKey: ['lines', plantId],
    queryFn: () => getLinesByPlant(plantId!),
    enabled: !!plantId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useEquipmentByLine = (lineId: string | undefined) => {
  return useQuery<Equipment[], Error>({
    queryKey: ['equipment', lineId],
    queryFn: () => getEquipmentByLine(lineId!),
    enabled: !!lineId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useShifts = () => {
  return useQuery<Shift[], Error>({
    queryKey: ['shifts'],
    queryFn: getShifts,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// ============================================
// OEE Data Hooks
// ============================================

interface OeeByEquipmentFilters {
  equipment_id?: string;
  line_id?: string;
  shift_id?: string;
  start_date: string;
  end_date: string;
}

export const useOeeByEquipment = (filters: OeeByEquipmentFilters) => {
  return useQuery<EquipmentOeeData[], Error>({
    queryKey: ['oee-by-equipment', filters],
    queryFn: async () => {
      const response = await getOeeByEquipment(filters);
      return response.data;
    },
    enabled: !!filters.start_date && !!filters.end_date,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

export const useOeeAggregateByShift = (filters: {
  line_id?: string;
  start_date: string;
  end_date: string;
}) => {
  return useQuery<ShiftAggregateOee[], Error>({
    queryKey: ['oee-aggregate-shift', filters],
    queryFn: () => getOeeAggregateByShift(filters),
    enabled: !!filters.start_date && !!filters.end_date,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useEquipmentComparison = (filters: {
  line_id: string;
  start_date: string;
  end_date: string;
}) => {
  return useQuery<EquipmentComparisonData[], Error>({
    queryKey: ['equipment-comparison', filters],
    queryFn: () => getEquipmentComparison(filters),
    enabled: !!filters.line_id && !!filters.start_date && !!filters.end_date,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useLossesByEquipment = (filters: {
  equipment_id: string;
  start_date: string;
  end_date: string;
}) => {
  return useQuery<EquipmentLossesData[], Error>({
    queryKey: ['losses-by-equipment', filters],
    queryFn: async () => {
      const response = await getLossesByEquipment(filters);
      return response.data;
    },
    enabled: !!filters.equipment_id && !!filters.start_date && !!filters.end_date,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useHourlyOeeData = (filters: {
  equipment_id: string;
  date: string;
}) => {
  return useQuery<HourlyOeeData[], Error>({
    queryKey: ['hourly-oee', filters],
    queryFn: () => getHourlyOeeData(filters),
    enabled: !!filters.equipment_id && !!filters.date,
    staleTime: 1 * 60 * 1000, // 1 minute for hourly data
    retry: 2,
  });
};
