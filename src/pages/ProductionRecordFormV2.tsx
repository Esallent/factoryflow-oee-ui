import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Save, Calculator, Settings, Clock, AlertCircle, TrendingUp, Target, CheckCircle, Database } from "lucide-react";
import { DateTimePicker } from "@/components/DateTimePicker";
import { ValidationBanner } from "@/components/ui/validation-banner";
import { handleValidationError, isLessOrEqual } from "@/lib/validation";
import { useTranslation } from "@/contexts/LanguageContext";
import { UnplannedDowntimesSection, UnplannedDowntime } from "@/components/UnplannedDowntimesSection";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  id_line: z.string().min(1, "Line is required"),
  id_equipment: z.string().min(1, "Equipment is required"),
  id_shift: z.string().min(1, "Shift is required"),
  shift_started_at_tz: z.date({ required_error: "Start time is required" }),
  shift_ended_at_tz: z.date({ required_error: "End time is required" }),
  planned_time_min: z.number().min(0.1, "Planned time must be greater than 0"),
  cycle_time_min: z.number().min(0.1, "Cycle time must be at least 0.1"),
  total_units: z.number().int().min(0, "Cannot be negative"),
  defective_units: z.number().int().min(0, "Cannot be negative"),
  microstops_min: z.number().min(0, "Cannot be negative").optional(),
  slow_speed_min: z.number().min(0, "Cannot be negative").optional(),
}).refine((data) => isLessOrEqual(data.defective_units, data.total_units), {
  message: "Defective units cannot exceed total units",
  path: ["defective_units"],
});

type FormValues = z.infer<typeof formSchema>;

interface OEEMetrics {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  band: string;
  band_color: string;
}

type DataSource = "auto" | "mixed" | "manual";

interface FieldSource {
  field: string;
  source: DataSource;
  integration_name?: string;
  last_sync?: string;
}

// Mock data
const mockLines = [
  { id: "line-1", name: "Production Line A" },
  { id: "line-2", name: "Production Line B" },
];

const mockEquipment = [
  { id: "eq-1", name: "CNC Machine #1" },
  { id: "eq-2", name: "CNC Machine #2" },
];

const mockShifts = [
  { id: "shift-1", name: "Morning Shift (6:00-14:00)" },
  { id: "shift-2", name: "Afternoon Shift (14:00-22:00)" },
  { id: "shift-3", name: "Night Shift (22:00-6:00)" },
];

const mockEquipmentPlannedDowntimes = {
  "eq-1": [
    { category_code: "MAINT", duration_min: 30, unit_type: "shift" },
    { category_code: "BREAK", duration_min: 15, unit_type: "shift" },
  ],
  "eq-2": [
    { category_code: "MAINT", duration_min: 20, unit_type: "shift" },
    { category_code: "BREAK", duration_min: 15, unit_type: "shift" },
  ],
};

export default function ProductionRecordFormV2() {
  const { t } = useTranslation();
  const [oeeMetrics, setOeeMetrics] = useState<OEEMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [unplannedDowntimes, setUnplannedDowntimes] = useState<UnplannedDowntime[]>([]);
  const [plannedDowntimeMin, setPlannedDowntimeMin] = useState(0);
  const [isValidated, setIsValidated] = useState(false);

  // Collapsible states
  const [identificationOpen, setIdentificationOpen] = useState(true);
  const [baseTimeOpen, setBaseTimeOpen] = useState(true);
  const [unplannedOpen, setUnplannedOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [indicatorsOpen, setIndicatorsOpen] = useState(true);
  const [sourceOpen, setSourceOpen] = useState(false);

  // Field sources (simulated - would come from backend)
  const [fieldSources] = useState<FieldSource[]>([
    { field: "cycle_time_min", source: "auto", integration_name: "SCADA System", last_sync: "14:30" },
    { field: "total_units", source: "auto", integration_name: "Production Counter", last_sync: "14:30" },
    { field: "planned_downtime_min", source: "auto", integration_name: "Line Config", last_sync: "06:00" },
  ]);

  const getFieldSource = (field: string): DataSource => {
    const source = fieldSources.find(s => s.field === field);
    return source?.source || "manual";
  };

  const getFieldSourceDetails = (field: string) => {
    return fieldSources.find(s => s.field === field);
  };

  const isFieldLocked = (field: string): boolean => {
    return getFieldSource(field) === "auto";
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_line: "",
      id_equipment: "",
      id_shift: "",
      planned_time_min: 480,
      cycle_time_min: 2.5,
      total_units: 145,
      defective_units: 5,
      microstops_min: 0,
      slow_speed_min: 0,
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    if (formValues.id_equipment) {
      const equipmentDowntimes = mockEquipmentPlannedDowntimes[formValues.id_equipment as keyof typeof mockEquipmentPlannedDowntimes] || [];
      const total = equipmentDowntimes.reduce((sum, dt) => sum + dt.duration_min, 0);
      setPlannedDowntimeMin(total);
    } else {
      setPlannedDowntimeMin(0);
    }
  }, [formValues.id_equipment]);

  const calculateOEE = async () => {
    if (!formValues.planned_time_min || formValues.cycle_time_min < 0.1) {
      return;
    }

    setIsCalculating(true);
    setValidationError("");

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const totalUnplannedDowntime = unplannedDowntimes.reduce((sum, dt) => sum + dt.duration_min, 0);
      const totalDowntime = plannedDowntimeMin + totalUnplannedDowntime;
      const runTime = formValues.planned_time_min - totalDowntime;
      const availability = runTime / formValues.planned_time_min;
      
      const idealCycleTime = formValues.cycle_time_min;
      const actualCycleTime = formValues.total_units > 0 ? runTime / formValues.total_units : 0;
      const performance = actualCycleTime > 0 ? Math.min(1, idealCycleTime / actualCycleTime) : 0;
      
      const quality = formValues.total_units > 0 ? 
        (formValues.total_units - formValues.defective_units) / formValues.total_units : 0;
      
      const oee = availability * performance * quality;
      
      let band = "inaceptable";
      let band_color = "#e74c3c";
      
      if (oee >= 0.95) {
        band = "excelente";
        band_color = "#27ae60";
      } else if (oee >= 0.85) {
        band = "bueno";
        band_color = "#2ecc71";
      } else if (oee >= 0.75) {
        band = "aceptable";
        band_color = "#f39c12";
      } else if (oee >= 0.65) {
        band = "regular";
        band_color = "#f39c12";
      }

      setOeeMetrics({
        availability: availability * 100,
        performance: performance * 100,
        quality: quality * 100,
        oee: oee * 100,
        band,
        band_color,
      });

      setIndicatorsOpen(true);

      toast({
        title: "Cálculo completado",
        description: "Indicadores OEE actualizados",
      });
    } catch (error) {
      console.error("OEE calculation failed", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setValidationError("");
    
    if (!oeeMetrics) {
      setValidationError("Debe calcular los indicadores OEE antes de guardar");
      return;
    }

    for (const downtime of unplannedDowntimes) {
      if (!downtime.category_code) {
        setValidationError(t("category_required"));
        return;
      }
      if (downtime.duration_min <= 0) {
        setValidationError(t("duration_invalid"));
        return;
      }
    }
    
    const totalUnplannedDowntime = unplannedDowntimes.reduce(
      (sum, dt) => sum + dt.duration_min, 
      0
    );
    
    if (totalUnplannedDowntime > data.planned_time_min) {
      setValidationError(t("total_downtime_exceeds"));
      return;
    }
    
    try {
      console.log("Saving record:", {
        ...data,
        source: "manual",
        source_detail: "Lovable_v2_enhanced_form",
        unplanned_downtimes: unplannedDowntimes,
        field_sources: fieldSources,
        validated: isValidated,
      });

      toast({
        title: t('success'),
        description: "Registro guardado correctamente",
      });

      form.reset();
      setOeeMetrics(null);
      setUnplannedDowntimes([]);
      setIsValidated(false);
    } catch (error: any) {
      const handled = await handleValidationError(error, form.setError);
      
      if (handled !== false && handled !== true && handled !== null && typeof handled === 'object') {
        setValidationError((handled as any).message);
        return;
      }
      
      if (!handled) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save production record",
        });
      }
    }
  };

  const getOverallSource = (): DataSource => {
    const autoCount = fieldSources.filter(s => s.source === "auto").length;
    if (autoCount === fieldSources.length) return "auto";
    if (autoCount > 0) return "mixed";
    return "manual";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Registro de Producción OEE 2.0</h1>
        <p className="text-muted-foreground">
          Formulario mejorado con soporte para orígenes de datos híbridos y cálculo jerárquico
        </p>
      </div>

      {validationError && (
        <ValidationBanner 
          message={validationError}
          onClose={() => setValidationError("")}
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 1. Identification Section */}
          <Collapsible open={identificationOpen} onOpenChange={setIdentificationOpen}>
            <Card className="bg-card border-border">
              <CollapsibleTrigger className="w-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">1. Identificación</h2>
                    <Badge variant="outline" className="ml-2">Requerido</Badge>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      identificationOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-4 border-t border-border pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="id_line"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('line_code')} *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={isFieldLocked('id_line')}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-sidebar border-border">
                                <SelectValue placeholder={t('select_line')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-border z-50">
                              {mockLines.map((line) => (
                                <SelectItem key={line.id} value={line.id}>
                                  {line.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="id_equipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('equipment_code')} *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={isFieldLocked('id_equipment')}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-sidebar border-border">
                                <SelectValue placeholder={t('select_equipment')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-border z-50">
                              {mockEquipment.map((eq) => (
                                <SelectItem key={eq.id} value={eq.id}>
                                  {eq.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="id_shift"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('shift')} *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={isFieldLocked('id_shift')}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-sidebar border-border">
                                <SelectValue placeholder={t('select_shift')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-border z-50">
                              {mockShifts.map((shift) => (
                                <SelectItem key={shift.id} value={shift.id}>
                                  {shift.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shift_started_at_tz"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('shift_start')} *</FormLabel>
                          <div className={isFieldLocked('shift_started_at_tz') ? 'opacity-50 pointer-events-none' : ''}>
                            <DateTimePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shift_ended_at_tz"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('shift_end')} *</FormLabel>
                          <div className={isFieldLocked('shift_ended_at_tz') ? 'opacity-50 pointer-events-none' : ''}>
                            <DateTimePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 2. Base Time & Planned Downtimes */}
          <Collapsible open={baseTimeOpen} onOpenChange={setBaseTimeOpen}>
            <Card className="bg-card border-border">
              <CollapsibleTrigger className="w-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">2. Tiempo Base y Paradas Planificadas</h2>
                    {getFieldSource('planned_downtime_min') !== 'manual' && (
                      <DataSourceBadge 
                        source={getFieldSource('planned_downtime_min')}
                        {...getFieldSourceDetails('planned_downtime_min')}
                      />
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      baseTimeOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-4 border-t border-border pt-6">
                  <FormField
                    control={form.control}
                    name="planned_time_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiempo planificado (TF) - minutos *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            className="bg-sidebar border-border"
                            disabled={isFieldLocked('planned_time_min')}
                            {...field}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0.1) {
                                field.onChange(val);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-status-warning mt-0.5" />
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium">Paradas planificadas desde configuración de línea</p>
                        <p className="text-sm text-muted-foreground">
                          Total: <span className="font-semibold text-foreground">{plannedDowntimeMin} min</span>
                        </p>
                        {plannedDowntimeMin > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Este valor proviene de la configuración del equipo. Puede ser modificado con confirmación.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 3. Unplanned Downtimes */}
          <Collapsible open={unplannedOpen} onOpenChange={setUnplannedOpen}>
            <Card className="bg-card border-border">
              <CollapsibleTrigger className="w-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <h2 className="text-xl font-semibold">3. Paradas No Planificadas</h2>
                    {unplannedDowntimes.length > 0 && (
                      <Badge variant="secondary">{unplannedDowntimes.length} registros</Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      unplannedOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 border-t border-border pt-6">
                  <UnplannedDowntimesSection
                    downtimes={unplannedDowntimes}
                    onChange={setUnplannedDowntimes}
                    shiftDurationMin={formValues.planned_time_min || 480}
                  />
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 4. Performance */}
          <Collapsible open={performanceOpen} onOpenChange={setPerformanceOpen}>
            <Card className="bg-card border-border">
              <CollapsibleTrigger className="w-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">4. Rendimiento</h2>
                    {getFieldSource('cycle_time_min') !== 'manual' && (
                      <DataSourceBadge 
                        source={getFieldSource('cycle_time_min')}
                        {...getFieldSourceDetails('cycle_time_min')}
                      />
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      performanceOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-4 border-t border-border pt-6">
                  <FormField
                    control={form.control}
                    name="cycle_time_min"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Tiempo de ciclo (min/unidad) *</FormLabel>
                          {getFieldSource('cycle_time_min') !== 'manual' && (
                            <DataSourceBadge 
                              source={getFieldSource('cycle_time_min')}
                              {...getFieldSourceDetails('cycle_time_min')}
                            />
                          )}
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="bg-sidebar border-border"
                            disabled={isFieldLocked('cycle_time_min')}
                            {...field}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0.01) {
                                field.onChange(val);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="microstops_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Microparadas (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              className="bg-sidebar border-border"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slow_speed_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Velocidad reducida (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              className="bg-sidebar border-border"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 5. Quality */}
          <Collapsible open={qualityOpen} onOpenChange={setQualityOpen}>
            <Card className="bg-card border-border">
              <CollapsibleTrigger className="w-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">5. Calidad</h2>
                    {getFieldSource('total_units') !== 'manual' && (
                      <DataSourceBadge 
                        source={getFieldSource('total_units')}
                        {...getFieldSourceDetails('total_units')}
                      />
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      qualityOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-4 border-t border-border pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="total_units"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Unidades totales *</FormLabel>
                            {getFieldSource('total_units') !== 'manual' && (
                              <DataSourceBadge 
                                source={getFieldSource('total_units')}
                                {...getFieldSourceDetails('total_units')}
                              />
                            )}
                          </div>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              className="bg-sidebar border-border"
                              disabled={isFieldLocked('total_units')}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="defective_units"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidades defectuosas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              className="bg-sidebar border-border"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 6. Calculated Indicators */}
          <Collapsible open={indicatorsOpen} onOpenChange={setIndicatorsOpen}>
            <Card className="bg-card border-border">
              <CollapsibleTrigger className="w-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-status-good" />
                    <h2 className="text-xl font-semibold">6. Indicadores Calculados</h2>
                    {oeeMetrics && (
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: oeeMetrics.band_color }}
                        className="text-white"
                      >
                        OEE: {oeeMetrics.oee.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      indicatorsOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 border-t border-border pt-6">
                  {!oeeMetrics ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Sin indicadores calculados</p>
                      <p className="text-sm">Presione el botón "Calcular" para actualizar los indicadores OEE</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4 bg-metric-bg border-border">
                        <p className="text-sm text-muted-foreground mb-1">Disponibilidad</p>
                        <p className="text-2xl font-bold text-foreground">{oeeMetrics.availability.toFixed(1)}%</p>
                      </Card>
                      <Card className="p-4 bg-metric-bg border-border">
                        <p className="text-sm text-muted-foreground mb-1">Rendimiento</p>
                        <p className="text-2xl font-bold text-foreground">{oeeMetrics.performance.toFixed(1)}%</p>
                      </Card>
                      <Card className="p-4 bg-metric-bg border-border">
                        <p className="text-sm text-muted-foreground mb-1">Calidad</p>
                        <p className="text-2xl font-bold text-foreground">{oeeMetrics.quality.toFixed(1)}%</p>
                      </Card>
                      <Card className="p-4 bg-metric-bg border-border">
                        <p className="text-sm text-muted-foreground mb-1">OEE Total</p>
                        <p className="text-2xl font-bold" style={{ color: oeeMetrics.band_color }}>
                          {oeeMetrics.oee.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{oeeMetrics.band}</p>
                      </Card>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 7. Source & Validation */}
          <Collapsible open={sourceOpen} onOpenChange={setSourceOpen}>
            <Card className="bg-card border-border">
              <CollapsibleTrigger className="w-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">7. Origen y Validación</h2>
                    <DataSourceBadge source={getOverallSource()} />
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      sourceOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-4 border-t border-border pt-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Fuentes de datos del registro:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fieldSources.map((source) => (
                        <div key={source.field} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                          <span className="text-sm text-muted-foreground">{source.field}</span>
                          <DataSourceBadge 
                            source={source.source}
                            integrationName={source.integration_name}
                            lastSync={source.last_sync}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg border border-border">
                    <Checkbox 
                      id="validated" 
                      checked={isValidated}
                      onCheckedChange={(checked) => setIsValidated(checked as boolean)}
                    />
                    <Label 
                      htmlFor="validated"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Validado por supervisor
                    </Label>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Action Buttons */}
          <Card className="p-6 bg-card border-border">
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOeeMetrics(null);
                  setUnplannedDowntimes([]);
                  setIsValidated(false);
                }}
              >
                Cancelar
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={calculateOEE}
                disabled={isCalculating}
                className="gap-2"
              >
                <Calculator className="h-4 w-4" />
                {isCalculating ? "Calculando..." : "Calcular"}
              </Button>

              <Button
                type="submit"
                className="gap-2"
                disabled={!oeeMetrics}
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
