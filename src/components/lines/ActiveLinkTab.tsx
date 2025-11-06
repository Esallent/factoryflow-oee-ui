import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ActiveLinkTabProps {
  selectedLineId: string;
}

// Mock equipment data - replace with API call filtered by line
const mockEquipment = [
  { id: "eq-1", name: "CNC Machine #1", code: "CNC-001" },
  { id: "eq-2", name: "CNC Machine #2", code: "CNC-002" },
  { id: "eq-3", name: "Robotic Arm #1", code: "ARM-001" },
];

export function ActiveLinkTab({ selectedLineId }: ActiveLinkTabProps) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");

  const handleLinkEquipment = async () => {
    if (!selectedLineId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a line from the General tab first",
      });
      return;
    }

    if (!selectedEquipmentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select equipment to link",
      });
      return;
    }

    try {
      // Execute PUT /lines/{id}/link_equipment
      // const response = await fetch(`/api/v1/lines/${selectedLineId}/link_equipment`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ active_equipment_id: selectedEquipmentId }),
      // });

      console.log("Linking equipment:", {
        lineId: selectedLineId,
        equipmentId: selectedEquipmentId,
      });

      toast({
        title: "Success",
        description: "Equipment linked successfully to production line",
      });

      setSelectedEquipmentId("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to link equipment to line",
      });
    }
  };

  // Filter equipment by selected line (mock logic)
  const filteredEquipment = selectedLineId ? mockEquipment : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Active Equipment Link</h2>
        <p className="text-sm text-muted-foreground">
          Link active equipment to the selected production line
        </p>
      </div>

      {!selectedLineId ? (
        <Card className="p-8 text-center bg-sidebar/50 border-border">
          <p className="text-muted-foreground">
            Please select or create a line in the General tab first
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 p-4 border border-border rounded-lg bg-sidebar/50">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Line</Label>
              <div className="p-3 bg-card border border-border rounded-md">
                <p className="font-mono text-primary">{selectedLineId}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment-select">Select Equipment to Link *</Label>
              <Select
                value={selectedEquipmentId}
                onValueChange={setSelectedEquipmentId}
              >
                <SelectTrigger
                  id="equipment-select"
                  className="bg-sidebar border-border"
                >
                  <SelectValue placeholder="Choose equipment from this line" />
                </SelectTrigger>
                <SelectContent>
                  {filteredEquipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {eq.code}
                        </span>
                        <span>{eq.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleLinkEquipment}
              disabled={!selectedEquipmentId}
              className="gap-2"
            >
              <Link className="h-4 w-4" />
              Link Active Equipment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
