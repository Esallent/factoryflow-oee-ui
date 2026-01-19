# API Integration - FactoryOS Backend

## Overview

This document describes the integration between the Lovable frontend and the FactoryOS backend (FastAPI on Replit).

## Architecture

The integration follows a three-layer architecture:

1. **API Client Layer** (`src/lib/apiClient.ts`) - Auto-generated SDK from backend
2. **Configuration Layer** (`src/lib/apiConfig.ts`) - Centralized config and error handling
3. **React Query Hooks** (`src/hooks/`) - Data fetching and state management

## Configuration

### API Key Setup

The API key is managed as a Lovable secret:

1. Navigate to Settings → Secrets in Lovable
2. Add secret named `VITE_API_KEY`
3. Enter your FactoryOS API key

The SDK automatically uses this key for all requests via:

```typescript
import.meta.env.VITE_API_KEY
```

### Backend URL

//Base URL: `https://factory-os-backend.replit.app`
Base URL: `https://85563b9aa0ff.ngrok-free.app`

## API Client SDK

The SDK is auto-generated from the backend and provides typed functions for all endpoints.

### Updating the SDK

**Manual update:**

```bash
sh scripts/update-api-client.sh
```

**Automatic update:**
The SDK is automatically updated on every build via the `prebuild` script in `package.json`.

### Available Functions

The SDK provides functions for:

- `getHealth()` - Health check
- `calculateOEE()` - OEE calculation (v1)
- `calculateOEEv2()` - OEE calculation (v2)
- `getRecords()` - Fetch OEE records
- `ingestData()` - Ingest production data
- `getIntegrationStatus()` - Integration status
- `getLossesCascade()` - Losses cascade data

## React Query Hooks

### OEE Data Hooks (`src/hooks/useOeeData.ts`)

**`useOeeDailyData(filters)`**

- Fetches daily OEE data for dashboards and charts
- Parameters: line, equipment, shift, date range
- Returns: Array of `DailyOeeData`

**`useOeeCascade(filters)`**

- Fetches cascade data for waterfall chart (TF → TNV)
- Returns: `OeeCascadeData` with time hierarchy

**`useOeeCalculation()`**

- Mutation hook for calculating OEE in real-time
- Used in production record form

### Records Hooks (`src/hooks/useRecords.ts`)

**`useRecords(filters)`**

- Fetches historical OEE records
- Supports pagination, filtering, sorting
- Returns: `{ records: OeeRecord[], total: number }`

**`useCreateRecord()`**

- Creates new OEE record
- Automatically invalidates records cache

**`useExportRecords()`**

- Exports records to CSV
- Applies current filters

### Integration Hooks (`src/hooks/useIntegrations.ts`)

**`useIntegrationStatus()`**

- Monitors integration health and status
- Auto-refetches every 30 seconds

**`useTestConnection()`**

- Tests integration connection
- Invalidates status cache on success

**`useHealthCheck()`**

- Basic backend health check
- Runs on app initialization

## Usage Examples

### Dashboard Data Fetching

```typescript
import { useOeeDailyData } from '@/hooks/useOeeData';

function Dashboard() {
  const { data, isLoading, error } = useOeeDailyData({
    line: 'Line A',
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return <OeeTrendChart data={data} />;
}
```

### Creating Records

```typescript
import { useCreateRecord } from '@/hooks/useRecords';
import { toast } from 'sonner';

function RecordForm() {
  const createRecord = useCreateRecord();

  const handleSubmit = async (values) => {
    try {
      await createRecord.mutateAsync(values);
      toast.success('Registro guardado exitosamente');
    } catch (error) {
      // Error is handled automatically by handleApiError
    }
  };
}
```

### Integration Monitoring

```typescript
import { useIntegrationStatus } from '@/hooks/useIntegrations';

function IntegrationsPanel() {
  const { data: integrations } = useIntegrationStatus();

  const activeCount = integrations?.filter(i => i.status === 'active').length;

  return <div>Active: {activeCount}</div>;
}
```

## Error Handling

All API errors are handled centrally by `handleApiError()` in `src/lib/apiConfig.ts`.

### Error Responses

| Status  | Message                     | Action                    |
| ------- | --------------------------- | ------------------------- |
| 401     | API Key inválida o expirada | Check VITE_API_KEY secret |
| 403     | Acceso denegado             | Verify permissions        |
| 429     | Límite de requests excedido | Wait and retry            |
| 500     | Error en el servidor        | Backend issue, retry      |
| Network | Error de conexión           | Check internet connection |

Errors are displayed to users via `sonner` toast notifications.

## Caching Strategy

React Query cache configuration (in `src/lib/queryClient.ts`):

- **Stale Time**: 5 minutes
- **Refetch on Window Focus**: Disabled
- **Retry**: 2 attempts (configurable per hook)

### Cache Invalidation

Cache is automatically invalidated on:

- Successful mutations (create, update, delete)
- Manual refresh by user
- Integration status changes

## Development Mode

### Mock Data Fallback

Components maintain mock data as fallback when:

- API is unreachable
- Development mode is enabled
- VITE_API_KEY is not configured

### Data Source Indicators

Components display badges indicating data source:

- 🟢 **LIVE** - Real data from API
- 🟡 **MOCK** - Fallback mock data
- 🔴 **ERROR** - API error occurred

## Testing

### Health Check

Verify backend connection:

```typescript
import { useHealthCheck } from '@/hooks/useIntegrations';

const { data } = useHealthCheck();
// Expected: { status: "ok" }
```

### Endpoint Validation

Test each endpoint:

```bash
# Health check
curl https://factory-os-backend.replit.app/api/v1/health

# Integration info
curl https://factory-os-backend.replit.app/integration/info

# SDK export
curl https://factory-os-backend.replit.app/integration/export?format=ts
```

## Troubleshooting

### SDK Not Found

**Problem**: Import errors for `apiClient.ts`

**Solution**:

```bash
sh scripts/update-api-client.sh
```

### Authentication Errors (401)

**Problem**: API Key invalid

**Solution**:

1. Verify `VITE_API_KEY` secret is set
2. Check API key is valid in backend
3. Regenerate API key if needed

### Network Errors

**Problem**: Cannot connect to backend

**Solution**:

1. Check backend is running at https://factory-os-backend.replit.app
2. Verify CORS is configured correctly
3. Check browser console for CORS errors

### Mock Data Still Showing

**Problem**: Real data not loading

**Solution**:

1. Check `VITE_API_KEY` is configured
2. Verify hooks are implemented in components
3. Check browser console for API errors
4. Ensure component is using the hook (not mock generator)

## CI/CD Integration

### Pre-build Hook

The `package.json` includes a pre-build hook:

```json
{
  "scripts": {
    "prebuild": "sh scripts/update-api-client.sh",
    "build": "vite build"
  }
}
```

This ensures the SDK is always up-to-date before building.

### Manual Build

To build with fresh SDK:

```bash
npm run prebuild
npm run build
```

## Security

### API Key Management

- ✅ API Key stored as Lovable secret
- ✅ Never committed to repository
- ✅ Accessed only via `import.meta.env.VITE_API_KEY`
- ✅ Included in headers automatically by SDK

### Error Messages

- ❌ Don't expose detailed error messages to users
- ✅ Log detailed errors to console for debugging
- ✅ Show user-friendly messages via toast

## Support

For issues with:

- **Backend API**: Contact FactoryOS DevOps team
- **Frontend Integration**: Check this documentation and browser console
- **SDK Updates**: Run `sh scripts/update-api-client.sh`

## Changelog

### v2.0 (Current)

- Initial integration with FactoryOS backend
- Auto-generated TypeScript SDK
- React Query hooks for all endpoints
- Centralized error handling
- Automatic SDK updates on build
- Mock data fallback for development

---

**Last Updated**: 2025-11-07  
**Backend Version**: v2.0  
**Frontend Version**: Current
