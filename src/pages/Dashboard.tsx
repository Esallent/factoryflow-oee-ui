import { Activity, Target, TrendingUp, Clock } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineSelector } from "@/components/LineSelector";
import { EquipmentSelector } from "@/components/EquipmentSelector";
import { useState } from "react";

const Dashboard = () => {
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">OEE Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of equipment effectiveness
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <LineSelector value={selectedLine} onValueChange={setSelectedLine} />
        <EquipmentSelector 
          value={selectedEquipment} 
          onValueChange={setSelectedEquipment}
          disabled={!selectedLine}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Overall OEE"
          value="78.5"
          unit="%"
          icon={Target}
          status="good"
          trend="up"
          subtitle="Target: 85%"
        />
        <KPICard
          title="Availability"
          value="92.3"
          unit="%"
          icon={Clock}
          status="good"
          trend="up"
        />
        <KPICard
          title="Performance"
          value="85.0"
          unit="%"
          icon={TrendingUp}
          status="warning"
          trend="neutral"
        />
        <KPICard
          title="Quality"
          value="96.8"
          unit="%"
          icon={Activity}
          status="good"
          trend="up"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Production Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Planned Production</span>
              <span className="font-semibold tabular-nums">1,000 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Actual Production</span>
              <span className="font-semibold tabular-nums">785 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Good Units</span>
              <span className="font-semibold text-success tabular-nums">760 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Defective Units</span>
              <span className="font-semibold text-destructive tabular-nums">25 units</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Downtime Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Planned Downtime</span>
              <span className="font-semibold tabular-nums">45 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unplanned Downtime</span>
              <span className="font-semibold text-warning tabular-nums">32 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Available Time</span>
              <span className="font-semibold tabular-nums">480 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Operating Time</span>
              <span className="font-semibold text-success tabular-nums">403 min</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
