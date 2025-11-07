import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "@/components/lines/GeneralTab";
import { EquipmentTab } from "@/components/lines/EquipmentTab";
import { ActiveLinkTab } from "@/components/lines/ActiveLinkTab";
import { DowntimeTemplatesTab } from "@/components/lines/DowntimeTemplatesTab";
import { UnplannedDowntimeCategoriesTab } from "@/components/lines/UnplannedDowntimeCategoriesTab";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/LanguageContext";

export default function LinesPage() {
  const { t } = useTranslation();
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");

  // Mock equipment data - in production, fetch from API
  const availableEquipment = [
    { id: "eq-1", name: "CNC Machine #1" },
    { id: "eq-2", name: "CNC Machine #2" },
    { id: "eq-3", name: "Robotic Arm #1" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('lines_equipment')}</h1>
        <p className="text-muted-foreground">
          {t('lines_subtitle')}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-sidebar border border-border">
          <TabsTrigger value="general">{t('lines')}</TabsTrigger>
          <TabsTrigger value="equipment">{t('select_equipment')}</TabsTrigger>
          <TabsTrigger value="downtime-templates">{t('downtime_templates')}</TabsTrigger>
          <TabsTrigger value="unplanned-categories">{t('unplanned_categories')}</TabsTrigger>
          <TabsTrigger value="active-link">{t('active')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <GeneralTab onLineSelect={setSelectedLineId} />
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <EquipmentTab 
            selectedLineId={selectedLineId}
            onEquipmentSelect={setSelectedEquipmentId}
          />
        </TabsContent>

        <TabsContent value="downtime-templates" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <DowntimeTemplatesTab 
              selectedEquipmentId={selectedEquipmentId}
              selectedLineId={selectedLineId}
              availableEquipment={availableEquipment}
            />
          </Card>
        </TabsContent>

        <TabsContent value="unplanned-categories" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <UnplannedDowntimeCategoriesTab />
          </Card>
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
