import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Save, Calculator } from "lucide-react";
import { DateTimePicker } from "@/components/DateTimePicker";
import { OEEKPICards } from "@/components/OEEKPICards";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  id_line: z.string().min(1, "Line is required"),
  id_equipment: z.string().min(1, "Equipment is required"),
  id_shift: z.string().min(1, "Shift is required"),
  shift_started_at_tz: z.date({ required_error: "Start time is required" }),
  shift_ended_at_tz: z.date({ required_error: "End time is required" }),
  planned_time_min: z.number().min(0.1, "Planned time must be greater than 0"),
  planned_downtime_min: z.number().min(0, "Cannot be negative"),
  unplanned_downtime_min: z.number().min(0, "Cannot be negative"),
  cycle_time_min: z.number().min(0.1, "Cycle time must be at least 0.1"),
  total_units: z.number().int().min(0, "Cannot be negative"),
  defective_units: z.number().int().min(0, "Cannot be negative"),
}).refine((data) => {
  const totalDowntime = data.planned_downtime_min + data.unplanned_downtime_min;
  return totalDowntime <= data.planned_time_min;
}, {
  message: "Total downtime cannot exceed planned time",
  path: ["unplanned_downtime_min"],
}).refine((data) => data.defective_units <= data.total_units, {
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

export default function ProductionRecordForm() {
  const [oeeMetrics, setOeeMetrics] = useState<OEEMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_line: "",
      id_equipment: "",
      id_shift: "",
      planned_time_min: 480,
      planned_downtime_min: 0,
      unplanned_downtime_min: 0,
      cycle_time_min: 1.0,
      total_units: 0,
      defective_units: 0,
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    const calculateOEE = async () => {
      if (!formValues.planned_time_min || formValues.cycle_time_min < 0.1) {
        return;
      }

      setIsCalculating(true);
      setValidationError("");

      try {
        // Simulate POST /api/v1/calculate
        // const response = await fetch('/api/v1/calculate', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formValues),
        // });
        // const data = await response.json();

        // Mock calculation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const totalDowntime = formValues.planned_downtime_min + formValues.unplanned_downtime_min;
        const runTime = formValues.planned_time_min - totalDowntime;
        const availability = runTime / formValues.planned_time_min;
        
        const idealCycleTime = formValues.cycle_time_min;
        const actualCycleTime = formValues.total_units > 0 ? runTime / formValues.total_units : 0;
        const performance = actualCycleTime > 0 ? Math.min(1, idealCycleTime / actualCycleTime) : 0;
        
        const quality = formValues.total_units > 0 ? 
          (formValues.total_units - formValues.defective_units) / formValues.total_units : 0;
        
        const oee = availability * performance * quality;
        
        let band = "unacceptable";
        let band_color = "#e74c3c";
        
        if (oee >= 0.85) {
          band = "excellence";
          band_color = "#27ae60";
        } else if (oee >= 0.75) {
          band = "good";
          band_color = "#2ecc71";
        } else if (oee >= 0.60) {
          band = "acceptable";
          band_color = "#f1c40f";
        } else if (oee >= 0.40) {
          band = "fair";
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
      } catch (error) {
        console.error("OEE calculation failed", error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateOEE();
  }, [
    formValues.planned_time_min,
    formValues.planned_downtime_min,
    formValues.unplanned_downtime_min,
    formValues.cycle_time_min,
    formValues.total_units,
    formValues.defective_units,
  ]);

  const onSubmit = async (data: FormValues) => {
    setValidationError("");
    
    try {
      // POST /api/v1/records
      // const response = await fetch('/api/v1/records', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...data,
      //     source: "manual",
      //     source_detail: "Lovable_v2_form",
      //   }),
      // });

      console.log("Saving record:", {
        ...data,
        source: "manual",
        source_detail: "Lovable_v2_form",
      });

      // Simulate success
      toast({
        title: "Success",
        description: "Saved successfully",
      });

      // Reset form
      form.reset();
      setOeeMetrics(null);
    } catch (error: any) {
      if (error.status === 400) {
        // Highlight invalid fields
        const errorData = await error.json();
        if (errorData.errors) {
          errorData.errors.forEach((err: { field: string; message: string }) => {
            form.setError(err.field as any, { message: err.message });
          });
        }
      } else if (error.status === 422) {
        setValidationError("Incomplete or invalid data.");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save production record",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Production Record Entry</h1>
        <p className="text-muted-foreground">
          Enter production data manually and view real-time OEE calculations
        </p>
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Inputs */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-4">Production Data</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="id_line"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production Line *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-sidebar border-border">
                          <SelectValue placeholder="Select line" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormLabel>Equipment *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-sidebar border-border">
                          <SelectValue placeholder="Select equipment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

              <FormField
                control={form.control}
                name="id_shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-sidebar border-border">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

              <FormField
                control={form.control}
                name="shift_started_at_tz"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Shift Start Time *</FormLabel>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift_ended_at_tz"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Shift End Time *</FormLabel>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="planned_time_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Time (min) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          className="bg-sidebar border-border"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cycle_time_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle Time (min) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          className="bg-sidebar border-border"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="planned_downtime_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Downtime (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          className="bg-sidebar border-border"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unplanned_downtime_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unplanned Downtime (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          className="bg-sidebar border-border"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Units *</FormLabel>
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

                <FormField
                  control={form.control}
                  name="defective_units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Defective Units</FormLabel>
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

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setOeeMetrics(null);
                  }}
                >
                  Reset
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Record
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        {/* Right Column - OEE KPI Cards */}
        <div className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Live OEE Metrics</h2>
              {isCalculating && (
                <Calculator className="h-5 w-5 text-primary animate-pulse" />
              )}
            </div>
            <OEEKPICards metrics={oeeMetrics} />
          </Card>
        </div>
      </div>
    </div>
  );
}
