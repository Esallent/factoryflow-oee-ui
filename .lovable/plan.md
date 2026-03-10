

# Documentacion de FactoryOS Frontend

La documentacion se generara como un archivo `DOCUMENTATION.md` en la raiz del proyecto, cubriendo la arquitectura completa de la aplicacion tal como esta construida actualmente.

## Contenido del documento

### 1. Resumen del proyecto
- FactoryOS: frontend de OEE para manufactura
- Stack: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Soporte bilingue (EN/ES) via LanguageContext
- Backend: FastAPI en Google Cloud Run (`oee-back-v2-15861740515.us-central1.run.app`)

### 2. Arquitectura de la aplicacion

```text
src/
├── pages/              # 13 páginas (rutas)
├── components/         # ~25 componentes de negocio
│   ├── ui/             # shadcn/ui primitives
│   ├── lines/          # Gestión de líneas
│   └── states/         # Empty/Error/Loading/Success
├── hooks/              # React Query hooks (v2.0 + v2.1)
├── lib/                # API client, config, utils, validation
├── contexts/           # LanguageContext (i18n)
├── types/              # OEE 2.1 type definitions
└── data/               # Demo datasets
```

### 3. Rutas y paginas
Documentar las 13 rutas del App.tsx con descripcion de cada pagina, indicando cuales usan Layout (sidebar) y cuales son standalone.

### 4. Modulos funcionales
- **Dashboard OEE v2.1** — Filtros jerarquicos, KPIs ponderados, comparativa de equipos, tendencias, cascada
- **Detalle de Equipo** — KPIs individuales, cascada de perdidas, tabla horaria
- **Registro de Produccion** — Formulario con validacion, calculo OEE en tiempo real
- **Historial** — Tabla con filtros, exportacion CSV
- **Lineas y Equipos** — CRUD con turnos, categorias de downtime
- **Integraciones** — Panel de estado de conexiones SCADA
- **Simulador OEE** — Wizard standalone de 3 pasos, calculo local, impacto economico
- **Demos** — Schaeffler y Spada

### 5. Capa de datos
- `apiConfig.ts` — URL base, API key, headers, manejo de errores
- `apiClient.ts` — SDK con endpoints v1, v2.0 y v2.1
- Hooks v2.0 (`useOeeData.ts`, `useRecords.ts`, `useIntegrations.ts`)
- Hooks v2.1 (`useOeeDataV21.ts`) — jerarquia, OEE por equipo, comparacion, perdidas, horario
- React Query config: staleTime 5min, retry 2, no refetch on focus

### 6. Sistema de tipos OEE 2.1
Documentar interfaces clave: `EquipmentOeeData`, `ShiftAggregateOee`, `EquipmentComparisonData`, `EquipmentLossesData`, `HourlyOeeData`, jerarquia `Plant > Line > Equipment`, helpers `getOeeBand`, `getOeeBandColor`

### 7. Calculo OEE
- Formula: TP = TF - planificadas, TO = TP - no planificadas, etc.
- OEE ponderado en dashboard: `Σ(OEE × TO) / Σ(TO)`
- Bandas de color: Excellence ≥95%, Good ≥85%, Acceptable ≥75%, Fair ≥65%, Unacceptable <65%

### 8. Endpoints del backend
Tabla completa con metodo, ruta, descripcion y parametros para los ~15 endpoints

### 9. Estado actual: Mock vs API real
Indicar que las paginas principales aun usan datos mock locales y que los hooks de API estan implementados pero no conectados

### 10. Componentes clave
Descripcion breve de cada componente de negocio con sus props principales

### 11. Configuracion y despliegue
- Variable de entorno: `VITE_API_KEY`
- Publicacion via Lovable o self-hosted
- Dominio personalizado

## Archivo a crear
- `DOCUMENTATION.md` en la raiz del proyecto (~400 lineas)

