import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { getIntegrationStatus, getHealth } from '@/lib/apiClient';

export interface IntegrationStatus {
  name: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  type: string;
  lastSync?: string;
  health?: {
    latency_ms?: number;
    success_rate?: number;
  };
}

export const useIntegrationStatus = () => {
  return useQuery({
    queryKey: ['integration-status'],
    queryFn: async (): Promise<IntegrationStatus[]> => {
      // TODO: Replace with actual API call when endpoint is ready
      throw new Error('API endpoint not yet implemented');
    },
    retry: 2,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useTestConnection = () => {
  return useMutation({
    mutationFn: async (integrationId: string) => {
      // TODO: Replace with actual API call when endpoint is ready
      throw new Error('API endpoint not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-status'] });
    },
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: 1,
  });
};
