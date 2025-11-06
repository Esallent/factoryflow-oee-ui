export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    record: "Record",
    history: "History",
    lines: "Lines & Equipment",
    demo: "Demo",
    demo_schaeffler: "Schaeffler México",
    demo_spada: "L.V. Spada",
    
    // Common actions
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    calculate: "Calculate",
    filter: "Filter",
    export: "Export CSV",
    search: "Search",
    
    // OEE Metrics
    oee: "OEE",
    availability: "Availability",
    performance: "Performance",
    quality: "Quality",
    
    // Status messages
    success: "Saved successfully",
    no_records: "No records found",
    no_data: "No data available",
    loading: "Loading...",
    
    // Errors
    error_invalid: "Invalid data",
    error_missing: "Incomplete data",
    error_occurred: "An error occurred",
    
    // Language selector
    lang_en: "English",
    lang_es: "Spanish",
    
    // Dashboard
    daily_oee: "Daily OEE Metrics",
    oee_trend: "OEE Trend",
    select_line: "Select Line",
    select_equipment: "Select Equipment",
    select_range: "Select Range",
    days_7: "Last 7 Days",
    days_30: "Last 30 Days",
    
    // Record form
    production_record: "Production Record",
    line_code: "Line Code",
    equipment_code: "Equipment Code",
    shift: "Shift",
    date: "Date",
    planned_time: "Planned Production Time (min)",
    downtime: "Downtime (min)",
    total_units: "Total Units",
    defective_units: "Defective Units",
    cycle_time: "Ideal Cycle Time (min)",
    
    // History
    production_history: "Production History",
    all_lines: "All Lines",
    all_equipment: "All Equipment",
    all_shifts: "All Shifts",
    
    // Lines & Equipment
    lines_equipment: "Lines & Equipment Management",
    add_line: "Add Line",
    add_equipment: "Add Equipment",
    line_name: "Line Name",
    equipment_name: "Equipment Name",
    active: "Active",
    inactive: "Inactive",
    
    // Empty states
    no_active_lines: "No active lines. Create one to start.",
    select_line_first: "Please select a line first",
    
    // Validation
    field_required: "This field is required",
    invalid_number: "Invalid number",
    defective_exceeds_total: "Defective units cannot exceed total units",
  },
  es: {
    // Navigation
    dashboard: "Tablero",
    record: "Registros",
    history: "Historial",
    lines: "Líneas y Equipos",
    demo: "Demo",
    demo_schaeffler: "Schaeffler México",
    demo_spada: "L.V. Spada",
    
    // Common actions
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    calculate: "Calcular",
    filter: "Filtrar",
    export: "Exportar CSV",
    search: "Buscar",
    
    // OEE Metrics
    oee: "OEE",
    availability: "Disponibilidad",
    performance: "Rendimiento",
    quality: "Calidad",
    
    // Status messages
    success: "Guardado correctamente",
    no_records: "No hay registros",
    no_data: "No hay datos disponibles",
    loading: "Cargando...",
    
    // Errors
    error_invalid: "Datos inválidos",
    error_missing: "Datos incompletos",
    error_occurred: "Ocurrió un error",
    
    // Language selector
    lang_en: "Inglés",
    lang_es: "Español",
    
    // Dashboard
    daily_oee: "Métricas OEE Diarias",
    oee_trend: "Tendencia OEE",
    select_line: "Seleccionar Línea",
    select_equipment: "Seleccionar Equipo",
    select_range: "Seleccionar Rango",
    days_7: "Últimos 7 Días",
    days_30: "Últimos 30 Días",
    
    // Record form
    production_record: "Registro de Producción",
    line_code: "Código de Línea",
    equipment_code: "Código de Equipo",
    shift: "Turno",
    date: "Fecha",
    planned_time: "Tiempo Planificado de Producción (min)",
    downtime: "Tiempo de Inactividad (min)",
    total_units: "Unidades Totales",
    defective_units: "Unidades Defectuosas",
    cycle_time: "Tiempo de Ciclo Ideal (min)",
    
    // History
    production_history: "Historial de Producción",
    all_lines: "Todas las Líneas",
    all_equipment: "Todos los Equipos",
    all_shifts: "Todos los Turnos",
    
    // Lines & Equipment
    lines_equipment: "Gestión de Líneas y Equipos",
    add_line: "Agregar Línea",
    add_equipment: "Agregar Equipo",
    line_name: "Nombre de Línea",
    equipment_name: "Nombre de Equipo",
    active: "Activo",
    inactive: "Inactivo",
    
    // Empty states
    no_active_lines: "No hay líneas activas. Crea una para comenzar.",
    select_line_first: "Por favor, seleccione una línea primero",
    
    // Validation
    field_required: "Este campo es obligatorio",
    invalid_number: "Número inválido",
    defective_exceeds_total: "Las unidades defectuosas no pueden exceder el total",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
