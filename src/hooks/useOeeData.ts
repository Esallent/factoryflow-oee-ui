import { useQuery, useMutation } from '@tanstack/react-query';
import { calculateOEEv2 } from '@/lib/apiClient';

// Types matching the backend response
export interface DailyOeeData {
  date: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  totalUnits: number;
  defectiveUnits: number;
  plannedDowntimeMin: number;
  unplannedDowntimeMin: number;
}

export interface OeeCascadeData {
  tf_min: number;
  tp_min: number;
  to_min: number;
  tno_min: number;
  tnv_min: number;
  planned_loss_min: number;
  unplanned_loss_min: number;
  performance_loss_min: number;
  quality_loss_min: number;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

export interface OeeFilters {
  line?: string;
  equipment?: string;
  shift?: string;
  startDate?: string;
  endDate?: string;
}

export const useOeeDailyData = (filters: OeeFilters) => {
  return useQuery({
    queryKey: ['oee-daily', filters],
    queryFn: async (): Promise<DailyOeeData[]> => {
      // TODO: Replace with actual API call when endpoint is ready
      // For now, return empty array to use mock data fallback in components
      throw new Error('API endpoint not yet implemented');
    },
    retry: 2,
  });
};

export const useOeeCascade = (filters: OeeFilters) => {
  return useQuery({
    queryKey: ['oee-cascade', filters],
    queryFn: async (): Promise<OeeCascadeData> => {
      // TODO: Replace with actual API call when endpoint is ready
      throw new Error('API endpoint not yet implemented');
    },
    retry: 2,
  });
};

export const useOeeCalculation = () => {
  return useMutation({
    mutationFn: calculateOEEv2,
  });
};
