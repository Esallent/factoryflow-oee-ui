import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { getRecords } from '@/lib/apiClient';

export interface OeeRecord {
  id: string;
  date: string;
  line: string;
  equipment: string;
  shift: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  totalUnits: number;
  defectiveUnits: number;
  source: string;
  validationStatus: string;
}

export interface RecordFilters {
  line?: string;
  equipment?: string;
  shift?: string;
  source?: string;
  validationStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const useRecords = (filters: RecordFilters) => {
  return useQuery({
    queryKey: ['records', filters],
    queryFn: async (): Promise<{ records: OeeRecord[], total: number }> => {
      // TODO: Replace with actual API call when endpoint is ready
      throw new Error('API endpoint not yet implemented');
    },
    retry: 2,
  });
};

export const useCreateRecord = () => {
  return useMutation({
    mutationFn: async (record: Partial<OeeRecord>) => {
      // TODO: Replace with actual API call when endpoint is ready
      throw new Error('API endpoint not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
};

export const useExportRecords = () => {
  return useMutation({
    mutationFn: async (filters: RecordFilters) => {
      // TODO: Replace with actual API call when endpoint is ready
      throw new Error('API endpoint not yet implemented');
    },
  });
};
