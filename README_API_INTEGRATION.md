# Integración con FactoryOS Backend - Guía de Configuración

## 🎯 Resumen

Esta guía describe cómo completar la integración entre el frontend Lovable y el backend FactoryOS (FastAPI en Replit).

## ✅ Estado Actual

**Completado:**
- ✅ Secret `VITE_API_KEY` configurado en Lovable
- ✅ Estructura de archivos creada:
  - `src/lib/apiClient.ts` (placeholder, requiere actualización)
  - `src/lib/apiConfig.ts` (configuración y manejo de errores)
  - `src/hooks/useOeeData.ts` (hooks para datos OEE)
  - `src/hooks/useRecords.ts` (hooks para registros)
  - `src/hooks/useIntegrations.ts` (hooks para integraciones)
  - `scripts/update-api-client.sh` (script de actualización del SDK)
  - `docs/API_INTEGRATION.md` (documentación completa)

**Pendiente:**
- ⏳ Descargar SDK real desde el backend (requiere ejecutar script con API key válida)
- ⏳ Actualizar componentes para usar hooks en lugar de mock data
- ⏳ Configurar script prebuild en package.json (manual)

## 📋 Pasos Siguientes

### 1. Actualizar el SDK desde el Backend

Una vez que tengas una API key válida, ejecuta el script para descargar el SDK:

```bash
sh scripts/update-api-client.sh
```

Este comando:
- Descarga el SDK TypeScript desde `https://factory-os-backend.replit.app/integration/export?format=ts`
- Sobrescribe `src/lib/apiClient.ts` con las funciones auto-generadas
- Valida que el archivo no esté vacío

**Nota:** El script usa el header `x-api-key` del `VITE_API_KEY` configurado. Asegúrate de que la API key sea válida.

### 2. Verificar el SDK Generado

Después de ejecutar el script, verifica que `src/lib/apiClient.ts` contiene las funciones esperadas:

```typescript
// Funciones esperadas en el SDK:
- getHealth()
- calculateOEE()
- calculateOEEv2()
- getRecords()
- ingestData()
- getIntegrationStatus()
- getLossesCascade()
```

### 3. Configurar Prebuild Script (Opcional)

Para actualizar automáticamente el SDK en cada build, agrega esto a `package.json`:

```json
{
  "scripts": {
    "prebuild": "sh scripts/update-api-client.sh",
    "build": "vite build"
  }
}
```

**Nota:** Este paso requiere edición manual de `package.json` ya que Lovable no permite modificarlo directamente.

### 4. Implementar Hooks en Componentes

Los siguientes componentes están listos para usar los hooks pero actualmente usan mock data:

#### `src/pages/OeeDashboardV2.tsx`
```typescript
// Reemplazar:
const [dailyData, setDailyData] = useState<DailyOeeData[]>([]);

// Por:
import { useOeeDailyData } from '@/hooks/useOeeData';
const { data: dailyData, isLoading, error } = useOeeDailyData(filters);
```

#### `src/pages/HistoryPageV2.tsx`
```typescript
// Reemplazar:
const [records, setRecords] = useState<OeeHistoryRecord[]>([]);

// Por:
import { useRecords } from '@/hooks/useRecords';
const { data, isLoading } = useRecords(filters);
const records = data?.records || [];
```

#### `src/pages/ProductionRecordFormV2.tsx`
```typescript
// Reemplazar cálculo manual por:
import { useOeeCalculation } from '@/hooks/useOeeData';
const calculateMutation = useOeeCalculation();

const handleCalculate = async () => {
  try {
    const result = await calculateMutation.mutateAsync(formData);
    setOeeMetrics(result);
    toast.success('OEE calculado exitosamente');
  } catch (error) {
    toast.error('Error al calcular OEE');
  }
};
```

#### `src/pages/IntegrationsPanel.tsx`
```typescript
// Agregar:
import { useIntegrationStatus } from '@/hooks/useIntegrations';
const { data: integrations, isLoading } = useIntegrationStatus();
```

#### `src/components/OeeWaterfallChart.tsx`
```typescript
// Agregar prop para datos de cascada:
import { useOeeCascade } from '@/hooks/useOeeData';
const { data: cascadeData } = useOeeCascade(filters);
```

### 5. Testing de la Integración

#### Health Check
```typescript
// En App.tsx o componente principal
import { useHealthCheck } from '@/hooks/useIntegrations';

function App() {
  const { data: health } = useHealthCheck();
  
  useEffect(() => {
    if (health?.status === 'ok') {
      console.log('✅ Backend connected');
    }
  }, [health]);
}
```

#### Test Endpoints Manualmente
```bash
# Health check
curl https://factory-os-backend.replit.app/api/v1/health

# Integration info
curl https://factory-os-backend.replit.app/integration/info

# Export SDK (requiere API key)
curl -H "x-api-key: YOUR_API_KEY" \
  https://factory-os-backend.replit.app/integration/export?format=ts
```

## 🔧 Arquitectura de la Integración

```
┌─────────────────────────────────────────────────────────┐
│                    Lovable Frontend                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Components (Pages & UI)                                 │
│  ↓ usa hooks                                            │
│  React Query Hooks (src/hooks/)                         │
│  ↓ llama funciones                                      │
│  API Client SDK (src/lib/apiClient.ts)                  │
│  ↓ usa configuración                                    │
│  API Config (src/lib/apiConfig.ts)                      │
│  ↓ headers con x-api-key                               │
│  FactoryOS Backend (Replit)                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Seguridad

- ✅ API Key almacenada como secret de Lovable
- ✅ Nunca commitear el API key al repositorio
- ✅ Headers automáticos en todas las requests
- ✅ Manejo centralizado de errores
- ✅ Mensajes de error user-friendly (no técnicos)

## 📊 Manejo de Estados

### Loading States
Los componentes deben mostrar:
- Skeleton loaders cuando `isLoading === true`
- Spinner en botones durante mutaciones

### Error States
Los errores se manejan automáticamente:
- Toast notifications vía `sonner`
- Fallback a mock data si está disponible
- Console logs para debugging

### Empty States
Mostrar mensajes claros cuando no hay datos disponibles.

## 🐛 Troubleshooting

### Error 401 al descargar SDK
**Causa:** API key inválida o no configurada

**Solución:**
1. Verifica que `VITE_API_KEY` esté configurado en Lovable Secrets
2. Verifica que la API key sea válida en el backend
3. Regenera la API key si es necesario

### SDK no se actualiza
**Causa:** Script no se ejecuta o falla silenciosamente

**Solución:**
```bash
# Ejecutar manualmente con verbose
sh -x scripts/update-api-client.sh

# Verificar permisos
chmod +x scripts/update-api-client.sh
```

### Componentes siguen mostrando mock data
**Causa:** Hooks no implementados en componentes

**Solución:**
1. Verificar que el componente importa y usa el hook
2. Verificar que el SDK está actualizado
3. Revisar console logs para errores de API

### Network errors
**Causa:** Backend no accesible o CORS mal configurado

**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar CORS en el backend permite el dominio de Lovable
3. Revisar Network tab en DevTools

## 📚 Recursos

- **Documentación completa:** `docs/API_INTEGRATION.md`
- **Backend URL:** https://factory-os-backend.replit.app
- **Endpoint discovery:** https://factory-os-backend.replit.app/integration/info
- **SDK export:** https://factory-os-backend.replit.app/integration/export?format=ts

## 🚀 Próximos Pasos para DevOps

1. **Validar conectividad:**
   - Ejecutar `sh scripts/update-api-client.sh` con API key válida
   - Verificar que el SDK se descarga correctamente

2. **Implementar hooks en componentes:**
   - Seguir ejemplos en la sección "Implementar Hooks en Componentes"
   - Probar cada componente individualmente

3. **Testing end-to-end:**
   - Health check funcionando
   - Cálculos OEE en tiempo real
   - CRUD de registros
   - Monitoreo de integraciones

4. **Configurar CI/CD:**
   - Agregar prebuild script a package.json
   - Configurar pipeline para actualizar SDK automáticamente

5. **Monitoreo:**
   - Verificar React Query cache funciona correctamente
   - Validar tiempos de respuesta
   - Configurar alertas para errores de API

## ✅ Checklist de Integración

- [ ] `VITE_API_KEY` configurado y válido
- [ ] SDK descargado exitosamente (`sh scripts/update-api-client.sh`)
- [ ] Health check retorna `{ status: "ok" }`
- [ ] Hooks implementados en OeeDashboardV2
- [ ] Hooks implementados en HistoryPageV2
- [ ] Hooks implementados en ProductionRecordFormV2
- [ ] Hooks implementados en IntegrationsPanel
- [ ] Toast notifications funcionando correctamente
- [ ] Loading states implementados
- [ ] Error handling validado
- [ ] Prebuild script configurado (opcional)
- [ ] Tests end-to-end completados

---

**Última actualización:** 2025-11-07  
**Backend Version:** v2.0  
**Autor:** Lovable AI + FactoryOS DevOps
