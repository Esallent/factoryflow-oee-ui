# FactoryOS Frontend — Documentación Técnica

> **Versión**: OEE Module v1.0 (Frontend v2.1)  
> **Stack**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui  
> **Última actualización**: Marzo 2026

---

## 1. Resumen del Proyecto

**FactoryOS** es un frontend de manufactura diseñado para monitorear métricas de **OEE (Overall Equipment Effectiveness)** a nivel de equipo, línea y planta. Soporta tanto ingreso manual de datos como integraciones automáticas con sistemas SCADA.

### Características principales

- Dashboard OEE con KPIs ponderados y comparativa de equipos
- Registro de producción con validación en tiempo real
- Historial con filtros, paginación y exportación CSV
- Gestión de líneas, equipos, turnos y categorías de downtime
- Simulador OEE standalone con cálculo de impacto económico
- Soporte bilingüe (Inglés / Español) con cambio dinámico
- Panel de integraciones SCADA

### Stack tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.3 | UI framework |
| Vite | 5.x | Build tool + dev server |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Component library (Radix primitives) |
| React Query | 5.x | Server state management |
| React Router | 6.x | Client-side routing |
| Recharts | 2.x | Charts and data visualization |
| React Hook Form + Zod | 7.x / 3.x | Form management + validation |
| date-fns | 3.x | Date formatting and manipulation |

### Backend

- **Runtime**: FastAPI en Google Cloud Run
- **URL base**: Configurada en `src/lib/apiConfig.ts`
- **Autenticación**: API Key via header `x-api-key`

---

## 2. Arquitectura de la Aplicación

```
src/
├── pages/                  # 13 páginas (rutas de la app)
├── components/             # ~25 componentes de negocio
│   ├── ui/                 # shadcn/ui primitives (~50 componentes)
│   ├── lines/              # Gestión de líneas (6 componentes)
│   └── states/             # Empty/Error/Loading/Success states
├── hooks/                  # React Query hooks
│   ├── useOeeData.ts       # Hooks v2.0 (legacy)
│   ├── useOeeDataV21.ts    # Hooks v2.1 (equipment-level)
│   ├── useRecords.ts       # CRUD de registros
│   └── useIntegrations.ts  # Estado de integraciones
├── lib/
│   ├── apiClient.ts        # SDK de endpoints del backend
│   ├── apiConfig.ts        # URL base, headers, error handling
│   ├── queryClient.ts      # React Query configuration
│   ├── validation.ts       # Utilidades de validación numérica
│   ├── translations.ts     # Diccionario i18n (EN/ES)
│   └── utils.ts            # Utilidades generales (cn, etc.)
├── contexts/
│   └── LanguageContext.tsx  # Provider de idioma (EN/ES)
├── types/
│   └── oee.ts              # Tipos OEE 2.1 completos
└── data/
    └── demoDataset.ts      # Datasets para demos
```

### Patrón de Layout

La aplicación usa un `Layout` wrapper que provee:
- **Sidebar colapsable** (`AppSidebar`) con navegación principal
- **Header** con logo, versión y selector de idioma (dropdown)
- Las páginas standalone (ej. Simulador) no usan Layout

---

## 3. Rutas y Páginas

| Ruta | Página | Layout | Descripción |
|---|---|---|---|
| `/` | — | — | Redirect a `/dashboard` |
| `/dashboard` | `OeeDashboardV2` | ✅ | Dashboard OEE v2.1 con filtros jerárquicos |
| `/dashboard-v1` | `OeeDashboard` | ✅ | Dashboard OEE v1 (legacy) |
| `/record` | `ProductionRecordFormV2` | ✅ | Formulario de registro v2 con downtimes |
| `/record-v1` | `ProductionRecordForm` | ✅ | Formulario de registro v1 (legacy) |
| `/history` | `HistoryPageV2` | ✅ | Historial con paginación y filtros |
| `/history-v1` | `HistoryPage` | ✅ | Historial v1 (legacy) |
| `/integrations` | `IntegrationsPanel` | ✅ | Panel de integraciones SCADA |
| `/lines` | `LinesPage` | ✅ | Gestión de líneas y equipos |
| `/equipment-detail` | `EquipmentDetailPage` | ✅ | Detalle de equipo (via query params) |
| `/simulator` | `OeeSimulator` | ❌ | Simulador OEE standalone (wizard) |
| `/demo/schaeffler` | `DemoSchaeffler` | ✅ | Demo con datos Schaeffler |
| `/demo/spada` | `DemoSpada` | ✅ | Demo con datos Spada |
| `*` | `NotFound` | ❌ | Página 404 |

### Navegación (Sidebar)

El sidebar muestra 5 enlaces principales y un grupo colapsable de demos:
1. **Dashboard** (`/dashboard`)
2. **Registro** (`/record`)
3. **Historial** (`/history`)
4. **Integraciones** (`/integrations`)
5. **Líneas** (`/lines`)
6. **Demos** (colapsable): Schaeffler, Spada

---

## 4. Módulos Funcionales

### 4.1 Dashboard OEE v2.1 (`OeeDashboardV2.tsx`)

**Archivo**: `src/pages/OeeDashboardV2.tsx` (~499 líneas)

Página principal con vista completa de métricas OEE. Incluye:

- **Filtros jerárquicos**: Planta → Línea → Equipo → Turno
- **Selector de rango de fechas**: Últimos 7, 14, 30, 60, 90 días
- **KPIs ponderados** (`OeeDashboardKPIs`): OEE, Disponibilidad, Rendimiento, Calidad
- **Badge de OEE ponderado** (`WeightedOeeBadge`): Muestra `Σ(OEE × TO) / Σ(TO)`
- **Gráfico de tendencia** (`OeeTrendChart`): Línea temporal con métricas OEE diarias
- **Cascada de pérdidas** (`OeeWaterfallChart`): Waterfall TF → TP → TO → TNO → TNV
- **Comparativa de equipos** (`EquipmentComparisonChart`): Barra horizontal con ranking
- **Toggle auto-refresh**: Polling cada 60 segundos
- **Navegación a detalle**: Click en equipo redirige a `/equipment-detail?id=...`

### 4.2 Detalle de Equipo (`EquipmentDetailPage.tsx`)

**Archivo**: `src/pages/EquipmentDetailPage.tsx` (~306 líneas)

Vista detallada de un equipo individual. Recibe `equipment_id` vía query params.

- **Header**: Nombre de equipo, línea, badge de data source
- **KPI Cards**: OEE, Disponibilidad, Rendimiento, Calidad con bandas de color
- **Tendencia diaria** (`OeeTrendChart`): Últimos N días del equipo
- **Cascada de pérdidas** (`EquipmentLossesCascade`): Desglose de tiempos perdidos
- **Tabla horaria** (`HourlyOeeTable`): OEE hora por hora del día seleccionado
- **Exportación**: Botón para descargar reporte CSV

### 4.3 Registro de Producción (`ProductionRecordFormV2.tsx`)

**Archivo**: `src/pages/ProductionRecordFormV2.tsx` (~912 líneas)

Formulario completo para ingreso manual de datos de producción.

**Campos del formulario** (validados con Zod):
- Línea, Equipo, Turno (selects)
- Fecha/hora inicio y fin del turno (`DateTimePicker`)
- Tiempo planificado (min), Tiempo ciclo (min/pieza)
- Unidades totales, Unidades defectuosas
- Microparadas (min), Velocidad reducida (min) — opcionales

**Funcionalidades**:
- Cálculo OEE en tiempo real conforme se ingresan datos
- Validación cruzada (ej. defectuosas ≤ total)
- Sección colapsable de **Downtimes no planificados** (`UnplannedDowntimesSection`)
- Indicador de data source por campo (manual / auto / mixed)
- `ValidationBanner` para errores de backend
- Preview de métricas calculadas antes de guardar

### 4.4 Historial (`HistoryPageV2.tsx`)

**Archivo**: `src/pages/HistoryPageV2.tsx` (~494 líneas)

Tabla de registros históricos con:

- **Filtros**: Línea, Equipo, Turno, Rango de fechas
- **Tabla**: Fecha, Línea, Equipo, Turno, OEE, A/P/Q, Banda, Fuente, Validación
- **Paginación**: Client-side con tamaño configurable
- **Exportación CSV**: Descarga de datos filtrados
- **Badges**: Data source (auto/manual/mixed), estado de validación
- **Bandas de color**: Visual por nivel de OEE

### 4.5 Gestión de Líneas (`LinesPage.tsx`)

**Archivo**: `src/pages/LinesPage.tsx`

CRUD completo para la jerarquía de producción, organizado en tabs:

| Tab | Componente | Funcionalidad |
|---|---|---|
| General | `GeneralTab` | Datos básicos de la línea |
| Equipos | `EquipmentTab` | CRUD de equipos con `EquipmentDialog` |
| Turnos | `ShiftsTab` | CRUD de turnos con `ShiftDialog` |
| Downtimes | `DowntimeCategoriesTab` | Categorías de downtime con `DowntimeCategoryDialog` |
| Active Link | `ActiveLinkTab` | Configuración de enlace activo |

### 4.6 Integraciones (`IntegrationsPanel.tsx`)

**Archivo**: `src/pages/IntegrationsPanel.tsx`

Panel de estado de conexiones SCADA/MES. Muestra:
- Estado de conexión (online/offline)
- Última sincronización
- Configuración de integración

### 4.7 Simulador OEE (`OeeSimulator.tsx`)

**Archivo**: `src/pages/OeeSimulator.tsx` (~988 líneas)

Aplicación standalone (sin sidebar) con wizard de 3 pasos:

**Paso 1 — Configuración del equipo**:
- Nombre, proceso, tiempo de turno (TF), tiempo ciclo, OEE target

**Paso 2 — Ingreso de paradas**:
- Paradas planificadas: setup, preventivo, cambio, otros
- Paradas no planificadas: material, mecánico, eléctrico, operación, energía, otros
- Unidades producidas y defectuosas

**Paso 3 — Resultados y análisis**:
- Cálculo OEE completo (A × P × Q)
- Cascada de tiempos: TF → TP → TO → TNO → TNV
- Gráfico de barras con desglose de pérdidas
- **Impacto económico**: Costo por hora × pérdidas = impacto en $
- Recomendaciones automáticas basadas en el componente más bajo

### 4.8 Demos

- **DemoSchaeffler** (`/demo/schaeffler`): Demo con dataset de Schaeffler
- **DemoSpada** (`/demo/spada`): Demo con dataset de Spada

Ambos usan datos precargados desde `src/data/demoDataset.ts`.

---

## 5. Capa de Datos

### 5.1 Configuración API (`apiConfig.ts`)

```typescript
API_CONFIG = {
  baseUrl: 'https://oee-back-v2-15861740515.us-central1.run.app',
  apiKey: import.meta.env.VITE_API_KEY,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': VITE_API_KEY
  }
}
```

**Funciones auxiliares**:
- `handleApiError(error)` — Toast de error según status code (401, 403, 429, 500, network)
- `isApiConfigured()` — Verifica si `VITE_API_KEY` está definida

### 5.2 Cliente API (`apiClient.ts`)

SDK centralizado con función base `fetchAPI(endpoint, options)` que:
- Prepends `baseUrl` al endpoint
- Inyecta headers de autenticación
- Lanza error con `status` si `!response.ok`

#### Endpoints disponibles

| Método | Endpoint | Función | Descripción |
|---|---|---|---|
| GET | `/api/v1/health` | `getHealth()` | Health check |
| POST | `/api/v2/calculate` | `calculateOEEv2(data)` | Cálculo OEE v2.0 |
| GET | `/api/v1/records` | `getRecords(filters)` | Lista de registros |
| GET | `/integration/info` | `getIntegrationStatus()` | Estado de integraciones |
| GET | `/api/v2/losses/cascade` | `getLossesCascade(filters)` | Cascada de pérdidas v2.0 |
| GET | `/api/v2/oee/by-equipment` | `getOeeByEquipment(filters)` | OEE por equipo (v2.1) |
| GET | `/api/v2/oee/aggregate-shift` | `getOeeAggregateByShift(filters)` | OEE agregado por turno |
| GET | `/api/v2/oee/compare-equipment` | `getEquipmentComparison(filters)` | Comparativa de equipos en línea |
| GET | `/api/v2/losses/by-equipment` | `getLossesByEquipment(filters)` | Pérdidas por equipo (v2.1) |
| GET | `/api/v2/oee/hourly` | `getHourlyOeeData(filters)` | Datos OEE horarios |
| GET | `/api/v2/hierarchy/plants` | `getPlants()` | Lista de plantas |
| GET | `/api/v2/hierarchy/plants/:id/lines` | `getLinesByPlant(id)` | Líneas por planta |
| GET | `/api/v2/hierarchy/lines/:id/equipment` | `getEquipmentByLine(id)` | Equipos por línea |
| GET | `/api/v2/hierarchy/shifts` | `getShifts()` | Lista de turnos |
| GET | `/reports/oee-daily.csv` | `exportOeeDailyCsv(filters)` | Exportar reporte CSV |

### 5.3 React Query Hooks

**Configuración global** (`queryClient.ts`):
- `staleTime`: 5 minutos
- `refetchOnWindowFocus`: false

#### Hooks v2.1 (`useOeeDataV21.ts`)

| Hook | Query Key | Params | Descripción |
|---|---|---|---|
| `usePlants()` | `['plants']` | — | Lista de plantas |
| `useLinesByPlant(plantId)` | `['lines', plantId]` | `plantId` | Líneas filtradas por planta |
| `useEquipmentByLine(lineId)` | `['equipment', lineId]` | `lineId` | Equipos filtrados por línea |
| `useShifts()` | `['shifts']` | — | Lista de turnos |
| `useOeeByEquipment(filters)` | `['oee-by-equipment', filters]` | `equipment_id?, line_id?, shift_id?, start_date, end_date` | OEE diario por equipo |
| `useOeeAggregateByShift(filters)` | `['oee-aggregate-shift', filters]` | `line_id?, start_date, end_date` | Agregado ponderado por turno |
| `useEquipmentComparison(filters)` | `['equipment-comparison', filters]` | `line_id, start_date, end_date` | Ranking de equipos |
| `useLossesByEquipment(filters)` | `['losses-by-equipment', filters]` | `equipment_id, start_date, end_date` | Cascada de pérdidas |
| `useHourlyOeeData(filters)` | `['hourly-oee', filters]` | `equipment_id, date` | OEE hora a hora |

Todos los hooks usan `staleTime: 2min` (excepto hierarchy: 5min, hourly: 1min), `retry: 2`, y `enabled` condicional.

#### Hooks v2.0 (legacy, no conectados)

- `useOeeDailyData(filters)` — Lanza error "not yet implemented"
- `useOeeCascade(data)` — Lanza error "not yet implemented"
- `useCalculateOee()` — Mutation que llama a `calculateOEEv2`
- `useRecords(filters)` — Lanza error "not yet implemented"
- `useCreateRecord()` / `useDeleteRecord()` — Mutations placeholder

---

## 6. Sistema de Tipos OEE 2.1

Definidos en `src/types/oee.ts`:

### Interfaces principales

```typescript
// Métricas base
interface OeeMetrics {
  availability: number;  // 0-1
  performance: number;   // 0-1
  quality: number;       // 0-1
  oee: number;           // 0-1
}

// OEE diario por equipo
interface EquipmentOeeData extends OeeMetrics {
  record_date, equipment_id, equipment_name,
  line_id, line_name, shift_id?, shift_name?,
  total_units, defective_units, expected_units,
  tf_min, tp_min, to_min, tno_min, tnv_min,
  cycle_time_min, data_source, oee_weighted?
}

// Agregado por turno
interface ShiftAggregateOee extends OeeMetrics {
  shift_id, shift_name, line_id, line_name,
  record_date, total_to_min, oee_weighted, equipment_count
}

// Comparativa de equipos
interface EquipmentComparisonData extends OeeMetrics {
  equipment_id, equipment_name, line_id, line_name,
  rank, oee_delta_vs_line_avg, to_min, total_units
}

// Pérdidas por equipo
interface EquipmentLossesData {
  equipment_id, equipment_name, record_date,
  tf_min, planned_loss_min/pct, unplanned_loss_min/pct,
  performance_loss_min/pct, quality_loss_min/pct,
  tnv_min/pct, loss_categories[]
}

// OEE horario
interface HourlyOeeData extends OeeMetrics {
  hour, equipment_id, units_produced, defective_units,
  tf_min, tp_min, to_min, tno_min, tnv_min, data_source
}
```

### Jerarquía

```
Plant (id, name)
  └── Line (id, name, plant_id)
       └── Equipment (id, name, line_id, cycle_time_min, is_active)

Shift (id, name, start_time, end_time)
```

### Data Source

```typescript
type DataSource = 'manual' | 'auto' | 'mixed';
```

- **manual**: Ingresado por operador
- **auto**: Capturado por integración SCADA
- **mixed**: Combinación de fuentes

---

## 7. Cálculo OEE

### Fórmula de tiempos

```
TF  (Tiempo de Turno)         = Duración total del turno
TP  (Tiempo Planificado)       = TF - Paradas planificadas
TO  (Tiempo Operativo)         = TP - Paradas no planificadas
TNO (Tiempo Neto Operativo)    = TO - Pérdidas de rendimiento
TNV (Tiempo Neto de Valor)     = TNO - Pérdidas de calidad
```

### Métricas

```
Disponibilidad = TO / TP
Rendimiento    = (Unidades × Tiempo Ciclo) / TO
Calidad        = (Unidades - Defectuosas) / Unidades
OEE            = Disponibilidad × Rendimiento × Calidad
```

### OEE Ponderado (Dashboard)

Para agregar múltiples equipos, se usa ponderación por tiempo operativo:

```
OEE Ponderado = Σ(OEE_i × TO_i) / Σ(TO_i)
```

Esto evita que equipos con poco tiempo operativo distorsionen el promedio.

### Bandas de OEE

| Banda | Rango | Color |
|---|---|---|
| Excellence | ≥ 95% | Verde oscuro `hsl(142, 76%, 36%)` |
| Good | ≥ 85% | Verde `hsl(142, 71%, 45%)` |
| Acceptable | ≥ 75% | Azul `hsl(217, 91%, 60%)` |
| Fair | ≥ 65% | Naranja `hsl(38, 92%, 50%)` |
| Unacceptable | < 65% | Rojo `hsl(0, 72%, 51%)` |

Funciones helper: `getOeeBand(oee)`, `getOeeBandColor(oee)`.

---

## 8. Componentes de Negocio

### Visualización de datos

| Componente | Props principales | Descripción |
|---|---|---|
| `OeeDashboardKPIs` | `data[]` | 4 KPI cards: OEE, A, P, Q |
| `OeeTrendChart` | `data[], showEquipmentDetail?` | Gráfico de línea temporal |
| `OeeWaterfallChart` | `data` | Cascada de tiempos TF→TNV |
| `EquipmentComparisonChart` | `data[], onEquipmentClick?` | Barra horizontal con ranking |
| `EquipmentLossesCascade` | `data` | Desglose de pérdidas por categoría |
| `HourlyOeeTable` | `data[]` | Tabla OEE hora a hora |
| `WeightedOeeBadge` | `weightedOee, equipmentCount` | Badge con OEE ponderado |
| `DataSourceBadge` | `source` | Badge auto/manual/mixed |
| `KPICard` | `title, value, icon, trend?` | Card genérica de KPI |

### Selectores y filtros

| Componente | Props principales | Descripción |
|---|---|---|
| `HierarchicalSelector` | `plants, lines, equipment, onChange` | Selector cascada Planta→Línea→Equipo |
| `EquipmentSelector` | `equipment[], value, onChange` | Selector de equipo individual |
| `LineSelector` | `lines[], value, onChange` | Selector de línea |
| `DatePicker` | `value, onChange` | Selector de fecha |
| `DateTimePicker` | `value, onChange` | Selector de fecha y hora |

### Estados de UI

| Componente | Descripción |
|---|---|
| `EmptyState` | Estado vacío genérico |
| `ErrorState` | Estado de error con retry |
| `LoadingState` | Skeleton / spinner |
| `SuccessState` | Confirmación de éxito |
| `EmptyDataCard` | Card vacía para secciones sin datos |

### Gestión de líneas (`components/lines/`)

| Componente | Descripción |
|---|---|
| `GeneralTab` | Tab de datos generales |
| `EquipmentTab` / `EquipmentDialog` | CRUD de equipos |
| `ShiftsTab` / `ShiftDialog` | CRUD de turnos |
| `DowntimeCategoriesTab` / `DowntimeCategoryDialog` | CRUD de categorías |
| `ActiveLinkTab` | Configuración de enlace activo |
| `EmptyLinesState` | Estado vacío de líneas |

---

## 9. Internacionalización (i18n)

### Implementación

- **Provider**: `LanguageContext.tsx` — wraps entire app
- **Diccionario**: `src/lib/translations.ts` — objeto `{ en: {...}, es: {...} }`
- **Idiomas**: `'en'` (English), `'es'` (Español)
- **Persistencia**: `localStorage.getItem('lang')`
- **Hook**: `useTranslation()` → `{ language, setLanguage, t }`

### Uso en componentes

```tsx
const { t } = useTranslation();
return <h1>{t('dashboard')}</h1>;
```

### Selector de idioma

Ubicado en el header (`Layout.tsx`), dropdown con bandera de globo.

---

## 10. Validación (`validation.ts`)

Utilidades para comparaciones numéricas con tolerancia (evita errores de punto flotante):

```typescript
const NUMERIC_TOLERANCE = 0.001;

numbersEqual(a, b)     // |a - b| <= tolerance
isGreaterThan(a, b)    // a - b > tolerance
isLessThan(a, b)       // b - a > tolerance
isGreaterOrEqual(a, b)
isLessOrEqual(a, b)
```

**Validación de formulario** (`ProductionRecordFormV2`):
- Zod schema con refinements
- `handleValidationError()` — mapea errores del backend a campos del formulario
- Cross-validation: `defective_units ≤ total_units`

---

## 11. Estado Actual: Mock vs API Real

### ⚠️ Páginas usando datos mock locales

| Página | Tipo de mock | Descripción |
|---|---|---|
| `OeeDashboardV2` | `mockPlants`, `mockLinesByPlant`, etc. + `generateMockDailyData()` | Datos jerárquicos y OEE hardcodeados |
| `EquipmentDetailPage` | `generateMockEquipmentData()`, `generateMockLossesData()`, `generateMockHourlyData()` | Genera datos aleatorios |
| `HistoryPageV2` | `generateMockRecords()` + `mockLines`, `mockEquipment`, `mockShifts` | Registros simulados |

### ✅ Hooks de API implementados pero no conectados

Los hooks en `useOeeDataV21.ts` están completamente tipados y listos para usar, pero las páginas no los importan. Para conectar al backend real:

1. Reemplazar mocks en cada página con los hooks correspondientes
2. Manejar estados `isLoading`, `isError`, `data` de React Query
3. Eliminar funciones `generateMock*()` y constantes `mock*`

### Hooks v2.0 con placeholder

Los hooks en `useOeeData.ts` y `useRecords.ts` lanzan `Error('API endpoint not yet implemented')` — son stubs para futura implementación.

---

## 12. Configuración y Despliegue

### Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `VITE_API_KEY` | ✅ | API Key para autenticación con el backend |

Configurar como secreto en Lovable o como variable de entorno en el hosting.

### Build

```bash
npm run build     # Genera dist/ con Vite
npm run dev       # Dev server con HMR
npm run preview   # Preview del build
```

### Despliegue

- **Lovable**: Publicación directa desde la plataforma
- **Self-hosted**: Servir la carpeta `dist/` con cualquier servidor estático (Nginx, Caddy, etc.)
- **Dominio personalizado**: Configurar en el hosting apuntando al servidor

### Script de actualización del API client

```bash
sh scripts/update-api-client.sh
```

Regenera `apiClient.ts` desde el backend. Requiere `VITE_API_KEY` configurada.

---

## 13. Dependencias Principales

### Producción

| Paquete | Propósito |
|---|---|
| `@tanstack/react-query` | Server state, caching, refetch |
| `react-router-dom` | Client routing |
| `recharts` | Charts (Bar, Line, Area, Waterfall) |
| `react-hook-form` + `zod` | Form state + validation |
| `date-fns` | Date formatting |
| `sonner` | Toast notifications |
| `lucide-react` | Icon library |
| `class-variance-authority` | Component variants |
| `tailwind-merge` + `clsx` | Class merging utilities |
| `cmdk` | Command palette (shadcn) |
| `vaul` | Drawer component |
| `embla-carousel-react` | Carousel |

### UI Components (Radix)

~20 Radix primitives para: accordion, dialog, dropdown, popover, select, tabs, tooltip, etc.

---

## 14. Próximos Pasos Recomendados

1. **Conectar páginas al backend real**: Reemplazar mocks con hooks de `useOeeDataV21.ts`
2. **Implementar endpoints de demo**: `POST /api/v2/demo/reset` y `/api/v2/demo/seed` en el backend
3. **Agregar botón de reset demo**: Componente `DemoControls` con confirmación y feedback
4. **Eliminar versiones v1**: Remover rutas `/dashboard-v1`, `/record-v1`, `/history-v1` una vez migrado
5. **Indicador LIVE/MOCK**: Badge visual que muestre si los datos son del backend o simulados
