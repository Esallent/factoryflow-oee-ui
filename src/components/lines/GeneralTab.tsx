import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const formSchema = z.object({
  line_code: z.string().min(1, "Line code is required").max(50),
  line_name: z.string().min(1, "Line name is required").max(200),
  active_flag: z.boolean(),
  active_equipment_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GeneralTabProps {
  onLineSelect?: (lineId: string) => void;
}

// Mock equipment data - replace with API call
const mockEquipment = [
  { id: "eq-1", name: "CNC Machine #1" },
  { id: "eq-2", name: "CNC Machine #2" },
  { id: "eq-3", name: "Robotic Arm #1" },
];

export function GeneralTab({ onLineSelect }: GeneralTabProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line_code: "",
      line_name: "",
      active_flag: true,
      active_equipment_id: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Try the primary endpoint first: PUT /lines/{id}/link_equipment
      try {
        // const response = await fetch(`/api/v1/lines/${lineId}/link_equipment`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ active_equipment_id: data.active_equipment_id }),
        // });
        
        // Simulate API call
        console.log("Attempting PUT /lines/{id}/link_equipment", data);
        
        // Simulate success
        toast({
          title: "Success",
          description: "Line saved successfully",
        });
        
        if (onLineSelect && data.line_code) {
          onLineSelect(data.line_code);
        }
      } catch (linkError) {
        // Fallback to PUT /lines/{id} with active_equipment_id
        console.log("Fallback to PUT /lines/{id}", data);
        
        // const fallbackResponse = await fetch(`/api/v1/lines/${lineId}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        
        toast({
          title: "Success (Beta Mode)",
          description: "Active link function in Beta mode",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save line configuration",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="line_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Line Code *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., LINE-001" 
                    className="bg-sidebar border-border"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="line_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Line Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Production Line A" 
                    className="bg-sidebar border-border"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active_equipment_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active Equipment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-sidebar border-border">
                      <SelectValue placeholder="Select equipment (optional)" />
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
            name="active_flag"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-sidebar p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable this production line
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Save Line Configuration
          </Button>
        </div>
      </form>
    </Form>
  );
}
