import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LineSelector } from "@/components/LineSelector";
import { EquipmentSelector } from "@/components/EquipmentSelector";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Record = () => {
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Production data recorded successfully");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Record Production Data</h1>
        <p className="text-muted-foreground">
          Manual entry of production metrics for OEE calculation
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Production Entry Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Production Line</Label>
                <LineSelector value={selectedLine} onValueChange={setSelectedLine} />
              </div>

              <div className="space-y-2">
                <Label>Equipment</Label>
                <EquipmentSelector 
                  value={selectedEquipment} 
                  onValueChange={setSelectedEquipment}
                  disabled={!selectedLine}
                />
              </div>

              <div className="space-y-2">
                <Label>Shift</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6:00 - 14:00)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (14:00 - 22:00)</SelectItem>
                    <SelectItem value="night">Night (22:00 - 6:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date"
                  type="date" 
                  className="bg-input border-border"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">Production Metrics</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="planned">Planned Production (units)</Label>
                  <Input 
                    id="planned"
                    type="number" 
                    placeholder="1000"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actual">Actual Production (units)</Label>
                  <Input 
                    id="actual"
                    type="number" 
                    placeholder="850"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="good">Good Units</Label>
                  <Input 
                    id="good"
                    type="number" 
                    placeholder="820"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defective">Defective Units</Label>
                  <Input 
                    id="defective"
                    type="number" 
                    placeholder="30"
                    className="bg-input border-border"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">Time Data (minutes)</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="available">Available Time</Label>
                  <Input 
                    id="available"
                    type="number" 
                    placeholder="480"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planned-downtime">Planned Downtime</Label>
                  <Input 
                    id="planned-downtime"
                    type="number" 
                    placeholder="45"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unplanned-downtime">Unplanned Downtime</Label>
                  <Input 
                    id="unplanned-downtime"
                    type="number" 
                    placeholder="35"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operating-time">Operating Time</Label>
                  <Input 
                    id="operating-time"
                    type="number" 
                    placeholder="400"
                    className="bg-input border-border"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Save Record
              </Button>
              <Button type="button" variant="outline">
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Record;
