import { toast } from "sonner";

export const API_CONFIG = {
  //baseUrl: 'https://factory-os-backend.replit.app',
  baseUrl: 'https://project-b49a951e-b470-4e35-aff-229024159082.us-central1.run.app',
  apiKey: import.meta.env.VITE_API_KEY,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY || '',
  },
};

export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.status === 401) {
    toast.error('API Key inválida o expirada');
  } else if (error.status === 403) {
    toast.error('Acceso denegado. Verifica tus permisos.');
  } else if (error.status === 429) {
    toast.error('Límite de requests excedido. Intenta más tarde.');
  } else if (error.status === 500) {
    toast.error('Error en el servidor. Intenta nuevamente.');
  } else if (error.message === 'Failed to fetch' || error.name === 'NetworkError') {
    toast.error('Error de conexión. Verifica tu red.');
  } else {
    toast.error('Error inesperado. Intenta nuevamente.');
  }
};

export const isApiConfigured = (): boolean => {
  return !!import.meta.env.VITE_API_KEY;
};
