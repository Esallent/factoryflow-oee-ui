import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "@/components/lines/GeneralTab";
import { EquipmentTab } from "@/components/lines/EquipmentTab";
import { ActiveLinkTab } from "@/components/lines/ActiveLinkTab";
import { Card } from "@/components/ui/card";

export default function LinesPage() {
  const [selectedLineId, setSelectedLineId] = useState<string>("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Lines & Equipment Management</h1>
        <p className="text-muted-foreground">
          Configure production lines, manage equipment, and set active links
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-sidebar border border-border">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="active-link">Active Link</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <GeneralTab onLineSelect={setSelectedLineId} />
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <EquipmentTab selectedLineId={selectedLineId} />
        </TabsContent>

        <TabsContent value="active-link" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <ActiveLinkTab selectedLineId={selectedLineId} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
