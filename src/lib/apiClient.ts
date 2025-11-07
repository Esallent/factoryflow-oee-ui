/**
 * FactoryOS Backend API Client
 * 
 * This file is auto-generated from the backend.
 * Run `sh scripts/update-api-client.sh` to update it.
 * 
 * The script requires VITE_API_KEY to be configured as a Lovable secret.
 */

import { API_CONFIG } from './apiConfig';

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

// Placeholder functions - will be replaced by auto-generated SDK
export const getHealth = async () => {
  return fetchAPI('/api/v1/health');
};

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

// Add more functions as needed from the auto-generated SDK
