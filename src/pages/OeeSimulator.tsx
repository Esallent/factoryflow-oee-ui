import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Plus, 
  Trash2, 
  Info, 
  Calculator,
  Factory,
  Clock,
  Target,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Zap,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

// Types
interface EquipmentConfig {
  name: string;
  process: string;
  shiftTime: number; // TF in minutes
  cycleTime: number; // min/piece
  targetOee: number; // 0-1
}

interface PlannedStop {
  id: string;
  type: 'setup' | 'preventive' | 'changeover' | 'other';
  duration: number;
}

interface UnplannedStop {
  id: string;
  category: 'material' | 'mechanical' | 'electrical' | 'operation' | 'energy' | 'other';
  duration: number;
  observation: string;
}

interface ProductionData {
  plannedStops: PlannedStop[];
  unplannedStops: UnplannedStop[];
  microStops: number;
  reducedSpeed: number;
  totalUnits: number;
  defectiveUnits: number;
}

interface EconomicParams {
  shiftsPerDay: number;
  daysPerYear: number;
  valuePerUnit: number;
}

interface OeeResults {
  TF: number;
  TP: number;
  TO: number;
  TNO: number;
  TNV: number;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  plannedLoss: number;
  unplannedLoss: number;
  performanceLoss: number;
  qualityLoss: number;
}

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

const getOeeBandColor = (oee: number): string => {
  if (oee >= 0.95) return 'hsl(142, 76%, 36%)';
  if (oee >= 0.85) return 'hsl(142, 71%, 45%)';
  if (oee >= 0.75) return 'hsl(217, 91%, 60%)';
  if (oee >= 0.65) return 'hsl(38, 92%, 50%)';
  return 'hsl(0, 72%, 51%)';
};

const getOeeBandLabel = (oee: number): string => {
  if (oee >= 0.95) return 'Excelente';
  if (oee >= 0.85) return 'Bueno';
  if (oee >= 0.75) return 'Aceptable';
  if (oee >= 0.65) return 'Regular';
  return 'Inaceptable';
};

// Tooltips content
const TOOLTIPS = {
  availability: "Impacta directamente en volumen anual.",
  performance: "Pérdida silenciosa: reduce capacidad sin alertas inmediatas.",
  quality: "Consume tiempo productivo sin retorno.",
  oee: "Indicador de conversión de tiempo en valor.",
  cascade: "Muestra cómo el tiempo disponible se degrada hasta generar valor.",
  economic: "Proyección anual del efecto financiero del desempeño observado.",
};

export default function OeeSimulator() {
  const [step, setStep] = useState(1);
  
  // Step 1: Equipment config
  const [equipment, setEquipment] = useState<EquipmentConfig>({
    name: '',
    process: '',
    shiftTime: 480,
    cycleTime: 1,
    targetOee: 0.85,
  });

  // Step 2: Production data
  const [production, setProduction] = useState<ProductionData>({
    plannedStops: [],
    unplannedStops: [],
    microStops: 0,
    reducedSpeed: 0,
    totalUnits: 0,
    defectiveUnits: 0,
  });

  // Step 3: Economic params
  const [economic, setEconomic] = useState<EconomicParams>({
    shiftsPerDay: 0,
    daysPerYear: 0,
    valuePerUnit: 0,
  });

  // Collapsible states
  const [openSections, setOpenSections] = useState({
    planned: true,
    unplanned: true,
    performance: true,
    quality: true,
  });

  // Validation
  const [errors, setErrors] = useState<string[]>([]);

  // Calculated values
  const theoreticalCapacity = equipment.cycleTime > 0 
    ? Math.floor(equipment.shiftTime / equipment.cycleTime) 
    : 0;

  const totalPlannedLoss = production.plannedStops.reduce((sum, s) => sum + s.duration, 0);
  const totalUnplannedLoss = production.unplannedStops.reduce((sum, s) => sum + s.duration, 0);
  const totalPerformanceLoss = production.microStops + production.reducedSpeed;
  
  // Calculate quality loss in time
  const qualityLossTime = production.defectiveUnits * equipment.cycleTime;

  // OEE Calculation
  const oeeResults = useMemo<OeeResults | null>(() => {
    const TF = equipment.shiftTime;
    const TP = TF - totalPlannedLoss;
    const TO = TP - totalUnplannedLoss;
    const TNO = TO - totalPerformanceLoss;
    const TNV = TNO - qualityLossTime;

    if (TP <= 0 || TO <= 0 || TNO <= 0) return null;

    const availability = TO / TP;
    const performance = TNO / TO;
    const quality = TNV / TNO;
    const oee = availability * performance * quality;

    return {
      TF,
      TP,
      TO,
      TNO,
      TNV: Math.max(0, TNV),
      availability: Math.max(0, Math.min(1, availability)),
      performance: Math.max(0, Math.min(1, performance)),
      quality: Math.max(0, Math.min(1, quality)),
      oee: Math.max(0, Math.min(1, oee)),
      plannedLoss: totalPlannedLoss,
      unplannedLoss: totalUnplannedLoss,
      performanceLoss: totalPerformanceLoss,
      qualityLoss: qualityLossTime,
    };
  }, [equipment.shiftTime, totalPlannedLoss, totalUnplannedLoss, totalPerformanceLoss, qualityLossTime]);

  // Economic calculations
  const economicImpact = useMemo(() => {
    if (!oeeResults || !economic.shiftsPerDay || !economic.daysPerYear || !economic.valuePerUnit) {
      return null;
    }

    const annualFactor = economic.shiftsPerDay * economic.daysPerYear;
    const cycleTime = equipment.cycleTime;

    const unitsLostPlanned = cycleTime > 0 ? totalPlannedLoss / cycleTime : 0;
    const unitsLostUnplanned = cycleTime > 0 ? totalUnplannedLoss / cycleTime : 0;
    const unitsLostPerformance = cycleTime > 0 ? totalPerformanceLoss / cycleTime : 0;
    const unitsLostQuality = production.defectiveUnits;

    const impactPlanned = unitsLostPlanned * economic.valuePerUnit * annualFactor;
    const impactUnplanned = unitsLostUnplanned * economic.valuePerUnit * annualFactor;
    const impactPerformance = unitsLostPerformance * economic.valuePerUnit * annualFactor;
    const impactQuality = unitsLostQuality * economic.valuePerUnit * annualFactor;
    const impactTotal = impactPlanned + impactUnplanned + impactPerformance + impactQuality;

    // Gap to target
    const currentOee = oeeResults.oee;
    const targetOee = equipment.targetOee;
    const oeeGap = Math.max(0, targetOee - currentOee);
    const potentialUnits = theoreticalCapacity * oeeGap;
    const impactGapTarget = potentialUnits * economic.valuePerUnit * annualFactor;

    return {
      unitsLostPlanned,
      unitsLostUnplanned,
      unitsLostPerformance,
      unitsLostQuality,
      impactPlanned,
      impactUnplanned,
      impactPerformance,
      impactQuality,
      impactTotal,
      impactGapTarget,
      annualFactor,
    };
  }, [oeeResults, economic, equipment.cycleTime, equipment.targetOee, totalPlannedLoss, totalUnplannedLoss, totalPerformanceLoss, production.defectiveUnits, theoreticalCapacity]);

  // Insights generation
  const insights = useMemo(() => {
    if (!oeeResults || !economicImpact) return [];

    const allInsights: { priority: number; text: string; type: 'availability' | 'performance' | 'quality' | 'oee' | 'gap' }[] = [];

    if (oeeResults.availability < 0.75) {
      allInsights.push({
        priority: economicImpact.impactUnplanned,
        type: 'availability',
        text: `Si se mantienen estos niveles de disponibilidad (${formatPercent(oeeResults.availability)}), el impacto anual estimado asociado a indisponibilidad dentro del tiempo planificado es de ${formatCurrency(economicImpact.impactUnplanned)}. Este costo se consolida turno a turno si no se detecta a tiempo.`,
      });
    }

    if (oeeResults.performance < 0.85) {
      allInsights.push({
        priority: economicImpact.impactPerformance,
        type: 'performance',
        text: `El rendimiento actual (${formatPercent(oeeResults.performance)}) representa una pérdida anual estimada de ${formatCurrency(economicImpact.impactPerformance)} por operar por debajo del ritmo esperado.`,
      });
    }

    if (oeeResults.quality < 0.95) {
      allInsights.push({
        priority: economicImpact.impactQuality,
        type: 'quality',
        text: `Las pérdidas por calidad implican un impacto anual estimado de ${formatCurrency(economicImpact.impactQuality)}.`,
      });
    }

    if (oeeResults.oee < 0.65) {
      allInsights.push({
        priority: economicImpact.impactTotal,
        type: 'oee',
        text: `Con un OEE de ${formatPercent(oeeResults.oee)}, la capacidad no monetizada representa aproximadamente ${formatCurrency(economicImpact.impactTotal)} por año.`,
      });
    }

    if (oeeResults.oee < equipment.targetOee) {
      allInsights.push({
        priority: economicImpact.impactGapTarget,
        type: 'gap',
        text: `Entre el OEE actual (${formatPercent(oeeResults.oee)}) y el objetivo (${formatPercent(equipment.targetOee)}) existe una oportunidad económica anual estimada de ${formatCurrency(economicImpact.impactGapTarget)}.`,
      });
    }

    return allInsights.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }, [oeeResults, economicImpact, equipment.targetOee]);

  // Validation function
  const validateStep2 = (): boolean => {
    const newErrors: string[] = [];
    
    if (totalPlannedLoss < 0 || totalUnplannedLoss < 0 || production.microStops < 0 || production.reducedSpeed < 0) {
      newErrors.push('Ningún tiempo puede ser negativo');
    }

    const totalLosses = totalPlannedLoss + totalUnplannedLoss + totalPerformanceLoss + qualityLossTime;
    if (totalLosses > equipment.shiftTime) {
      newErrors.push('La suma de pérdidas no puede superar el tiempo de turno');
    }

    if (production.defectiveUnits > production.totalUnits) {
      newErrors.push('Las unidades defectuosas no pueden superar las unidades totales');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handlers
  const addPlannedStop = () => {
    setProduction(prev => ({
      ...prev,
      plannedStops: [...prev.plannedStops, { id: generateId(), type: 'setup', duration: 0 }],
    }));
  };

  const removePlannedStop = (id: string) => {
    setProduction(prev => ({
      ...prev,
      plannedStops: prev.plannedStops.filter(s => s.id !== id),
    }));
  };

  const updatePlannedStop = (id: string, field: keyof PlannedStop, value: any) => {
    setProduction(prev => ({
      ...prev,
      plannedStops: prev.plannedStops.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const addUnplannedStop = () => {
    setProduction(prev => ({
      ...prev,
      unplannedStops: [...prev.unplannedStops, { id: generateId(), category: 'mechanical', duration: 0, observation: '' }],
    }));
  };

  const removeUnplannedStop = (id: string) => {
    setProduction(prev => ({
      ...prev,
      unplannedStops: prev.unplannedStops.filter(s => s.id !== id),
    }));
  };

  const updateUnplannedStop = (id: string, field: keyof UnplannedStop, value: any) => {
    setProduction(prev => ({
      ...prev,
      unplannedStops: prev.unplannedStops.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const goToStep = (newStep: number) => {
    if (newStep === 3 && step === 2) {
      if (!validateStep2()) return;
    }
    setStep(newStep);
  };

  // Waterfall chart data
  const waterfallData = oeeResults ? [
    { name: 'Tiempo de turno', value: oeeResults.TF, fill: 'hsl(217, 91%, 60%)', type: 'total' },
    { name: 'Pérdidas planificadas', value: oeeResults.plannedLoss, fill: 'hsl(215, 15%, 45%)', type: 'loss' },
    { name: 'Tiempo planificado', value: oeeResults.TP, fill: 'hsl(199, 89%, 48%)', type: 'subtotal' },
    { name: 'Paradas no planif.', value: oeeResults.unplannedLoss, fill: 'hsl(0, 72%, 51%)', type: 'loss' },
    { name: 'Tiempo operativo', value: oeeResults.TO, fill: 'hsl(38, 92%, 50%)', type: 'subtotal' },
    { name: 'Pérdidas rendimiento', value: oeeResults.performanceLoss, fill: 'hsl(271, 81%, 56%)', type: 'loss' },
    { name: 'Tiempo neto operativo', value: oeeResults.TNO, fill: 'hsl(158, 64%, 52%)', type: 'subtotal' },
    { name: 'Pérdidas calidad', value: oeeResults.qualityLoss, fill: 'hsl(340, 82%, 52%)', type: 'loss' },
    { name: 'Tiempo neto valioso', value: oeeResults.TNV, fill: 'hsl(142, 76%, 36%)', type: 'final' },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Simulador OEE</h1>
                <p className="text-sm text-muted-foreground">Análisis de impacto económico</p>
              </div>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <button
                    onClick={() => s < step && goToStep(s)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      s === step 
                        ? 'bg-primary text-primary-foreground' 
                        : s < step 
                          ? 'bg-primary/20 text-primary cursor-pointer hover:bg-primary/30' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </button>
                  {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Step 1: Equipment Config */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Configuración del Equipo</h2>
              <p className="text-muted-foreground">Define los parámetros base del equipo productivo</p>
            </div>

            <Card className="p-6 bg-card border-border max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                      Nombre del equipo
                    </Label>
                    <Input
                      value={equipment.name}
                      onChange={(e) => setEquipment(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: CNC Torno #1"
                      className="bg-sidebar border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proceso / Producto</Label>
                    <Input
                      value={equipment.process}
                      onChange={(e) => setEquipment(prev => ({ ...prev, process: e.target.value }))}
                      placeholder="Ej: Mecanizado de ejes"
                      className="bg-sidebar border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Tiempo de turno (TF)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={equipment.shiftTime}
                        onChange={(e) => setEquipment(prev => ({ ...prev, shiftTime: Math.max(0, Number(e.target.value)) }))}
                        className="bg-sidebar border-border"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      Tiempo de ciclo ideal
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={equipment.cycleTime}
                        onChange={(e) => setEquipment(prev => ({ ...prev, cycleTime: Math.max(0.01, Number(e.target.value)) }))}
                        className="bg-sidebar border-border"
                      />
                      <span className="text-sm text-muted-foreground">min/pieza</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    OEE Objetivo: {formatPercent(equipment.targetOee)}
                  </Label>
                  <Slider
                    value={[equipment.targetOee * 100]}
                    onValueChange={([value]) => setEquipment(prev => ({ ...prev, targetOee: value / 100 }))}
                    min={50}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50%</span>
                    <span>75%</span>
                    <span>85%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Calculated field */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Capacidad teórica por turno</span>
                    <span className="text-lg font-bold text-primary">{theoreticalCapacity.toLocaleString()} piezas</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center">
              <Button onClick={() => goToStep(2)} className="gap-2" size="lg">
                Continuar
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Production Data */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Registro Productivo</h2>
              <p className="text-muted-foreground">Ingresa los datos de operación del turno</p>
            </div>

            {/* Validation errors */}
            {errors.length > 0 && (
              <Card className="p-4 bg-destructive/10 border-destructive/30">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Errores de validación</p>
                    <ul className="text-sm text-destructive/80 mt-1 list-disc list-inside">
                      {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Planned Stops */}
            <Collapsible open={openSections.planned} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, planned: open }))}>
              <Card className="bg-card border-border overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Paradas Planificadas</span>
                    <span className="text-sm text-muted-foreground">({totalPlannedLoss} min)</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.planned ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-3">
                    {production.plannedStops.map((stop) => (
                      <div key={stop.id} className="flex items-center gap-3">
                        <Select value={stop.type} onValueChange={(v) => updatePlannedStop(stop.id, 'type', v)}>
                          <SelectTrigger className="w-40 bg-sidebar border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="setup">Setup</SelectItem>
                            <SelectItem value="preventive">Preventivo</SelectItem>
                            <SelectItem value="changeover">Cambio</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={stop.duration}
                          onChange={(e) => updatePlannedStop(stop.id, 'duration', Math.max(0, Number(e.target.value)))}
                          className="w-24 bg-sidebar border-border"
                          placeholder="min"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                        <Button variant="ghost" size="icon" onClick={() => removePlannedStop(stop.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addPlannedStop} className="gap-2">
                      <Plus className="h-4 w-4" /> Agregar parada
                    </Button>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Unplanned Stops */}
            <Collapsible open={openSections.unplanned} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, unplanned: open }))}>
              <Card className="bg-card border-border overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="font-medium">Paradas No Planificadas</span>
                    <span className="text-sm text-muted-foreground">({totalUnplannedLoss} min)</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.unplanned ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-3">
                    {production.unplannedStops.map((stop) => (
                      <div key={stop.id} className="flex items-center gap-3 flex-wrap">
                        <Select value={stop.category} onValueChange={(v) => updateUnplannedStop(stop.id, 'category', v)}>
                          <SelectTrigger className="w-36 bg-sidebar border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="mechanical">Mecánica</SelectItem>
                            <SelectItem value="electrical">Eléctrica</SelectItem>
                            <SelectItem value="operation">Operación</SelectItem>
                            <SelectItem value="energy">Energía</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={stop.duration}
                          onChange={(e) => updateUnplannedStop(stop.id, 'duration', Math.max(0, Number(e.target.value)))}
                          className="w-24 bg-sidebar border-border"
                          placeholder="min"
                        />
                        <Input
                          value={stop.observation}
                          onChange={(e) => updateUnplannedStop(stop.id, 'observation', e.target.value)}
                          className="flex-1 min-w-[150px] bg-sidebar border-border"
                          placeholder="Observación"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeUnplannedStop(stop.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addUnplannedStop} className="gap-2">
                      <Plus className="h-4 w-4" /> Agregar parada
                    </Button>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Performance */}
            <Collapsible open={openSections.performance} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, performance: open }))}>
              <Card className="bg-card border-border overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Rendimiento</span>
                    <span className="text-sm text-muted-foreground">({totalPerformanceLoss} min)</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.performance ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Microparadas</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={production.microStops}
                          onChange={(e) => setProduction(prev => ({ ...prev, microStops: Math.max(0, Number(e.target.value)) }))}
                          className="bg-sidebar border-border"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Velocidad reducida</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={production.reducedSpeed}
                          onChange={(e) => setProduction(prev => ({ ...prev, reducedSpeed: Math.max(0, Number(e.target.value)) }))}
                          className="bg-sidebar border-border"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Quality */}
            <Collapsible open={openSections.quality} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, quality: open }))}>
              <Card className="bg-card border-border overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Calidad</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.quality ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Unidades totales producidas</Label>
                      <Input
                        type="number"
                        value={production.totalUnits}
                        onChange={(e) => setProduction(prev => ({ ...prev, totalUnits: Math.max(0, Number(e.target.value)) }))}
                        className="bg-sidebar border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidades defectuosas</Label>
                      <Input
                        type="number"
                        value={production.defectiveUnits}
                        onChange={(e) => setProduction(prev => ({ ...prev, defectiveUnits: Math.max(0, Number(e.target.value)) }))}
                        className="bg-sidebar border-border"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => goToStep(1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button onClick={() => goToStep(3)} className="gap-2" size="lg">
                Ver Resultados
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && oeeResults && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Resultados del Análisis</h2>
              <p className="text-muted-foreground">
                {equipment.name ? `${equipment.name} — ` : ''}{equipment.process || 'Simulación OEE'}
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Availability */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="p-4 bg-card border-border cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-muted-foreground">Disponibilidad</span>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatPercent(oeeResults.availability)}</p>
                  </Card>
                </TooltipTrigger>
                <TooltipContent><p>{TOOLTIPS.availability}</p></TooltipContent>
              </Tooltip>

              {/* Performance */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="p-4 bg-card border-border cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-muted-foreground">Rendimiento</span>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatPercent(oeeResults.performance)}</p>
                  </Card>
                </TooltipTrigger>
                <TooltipContent><p>{TOOLTIPS.performance}</p></TooltipContent>
              </Tooltip>

              {/* Quality */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="p-4 bg-card border-border cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-muted-foreground">Calidad</span>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatPercent(oeeResults.quality)}</p>
                  </Card>
                </TooltipTrigger>
                <TooltipContent><p>{TOOLTIPS.quality}</p></TooltipContent>
              </Tooltip>

              {/* OEE Total */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 border-2 cursor-help"
                    style={{ 
                      borderColor: getOeeBandColor(oeeResults.oee),
                      backgroundColor: `${getOeeBandColor(oeeResults.oee)}10`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" style={{ color: getOeeBandColor(oeeResults.oee) }} />
                      <span className="text-sm text-muted-foreground">OEE Total</span>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold" style={{ color: getOeeBandColor(oeeResults.oee) }}>
                      {formatPercent(oeeResults.oee)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: getOeeBandColor(oeeResults.oee) }}>
                      {getOeeBandLabel(oeeResults.oee)}
                    </p>
                  </Card>
                </TooltipTrigger>
                <TooltipContent><p>{TOOLTIPS.oee}</p></TooltipContent>
              </Tooltip>
            </div>

            {/* Waterfall Chart */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-6 bg-card border-border cursor-help">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">Cascada de Tiempos</h3>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={waterfallData} layout="vertical" margin={{ left: 140, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v} min`} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={130} tick={{ fontSize: 12 }} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [`${value.toFixed(1)} min`, 'Duración']}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {waterfallData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} opacity={entry.type === 'loss' ? 0.7 : 1} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TooltipTrigger>
              <TooltipContent><p>{TOOLTIPS.cascade}</p></TooltipContent>
            </Tooltip>

            {/* Economic Impact Section */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Proyección de Impacto Económico</h3>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent><p>{TOOLTIPS.economic}</p></TooltipContent>
                </Tooltip>
              </div>

              {/* Economic inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Turnos por día</Label>
                  <Input
                    type="number"
                    value={economic.shiftsPerDay || ''}
                    onChange={(e) => setEconomic(prev => ({ ...prev, shiftsPerDay: Math.max(0, Number(e.target.value)) }))}
                    placeholder="Ej: 3"
                    className="bg-sidebar border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Días operativos por año</Label>
                  <Input
                    type="number"
                    value={economic.daysPerYear || ''}
                    onChange={(e) => setEconomic(prev => ({ ...prev, daysPerYear: Math.max(0, Number(e.target.value)) }))}
                    placeholder="Ej: 250"
                    className="bg-sidebar border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor por unidad (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={economic.valuePerUnit || ''}
                    onChange={(e) => setEconomic(prev => ({ ...prev, valuePerUnit: Math.max(0, Number(e.target.value)) }))}
                    placeholder="Ej: 15.50"
                    className="bg-sidebar border-border"
                  />
                </div>
              </div>

              {/* Economic results */}
              {economicImpact ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Pérdidas planificadas</p>
                      <p className="text-lg font-bold text-muted-foreground">{formatCurrency(economicImpact.impactPlanned)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-xs text-muted-foreground mb-1">Pérdidas no planificadas</p>
                      <p className="text-lg font-bold text-destructive">{formatCurrency(economicImpact.impactUnplanned)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xs text-muted-foreground mb-1">Pérdidas rendimiento</p>
                      <p className="text-lg font-bold text-amber-500">{formatCurrency(economicImpact.impactPerformance)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <p className="text-xs text-muted-foreground mb-1">Pérdidas calidad</p>
                      <p className="text-lg font-bold text-purple-500">{formatCurrency(economicImpact.impactQuality)}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Impacto Total Anual</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(economicImpact.impactTotal)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Completa los parámetros económicos para ver la proyección anual</p>
                </div>
              )}
            </Card>

            {/* Insights */}
            {insights.length > 0 && (
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-semibold">Insights Clave</h3>
                </div>
                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => goToStep(2)} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Editar datos
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">¿Querés ver esto en tiempo real en tu planta?</p>
                <Button variant="default" className="gap-2">
                  Conocé FactoryOS
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
