import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "@/components/lines/GeneralTab";
import { EquipmentTab } from "@/components/lines/EquipmentTab";
import { DowntimeCategoriesTab } from "@/components/lines/DowntimeCategoriesTab";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/LanguageContext";

export default function LinesPage() {
  const { t } = useTranslation();
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('lines_equipment')}</h1>
        <p className="text-muted-foreground">
          {t('lines_subtitle')}
        </p>
      </div>

      <Tabs defaultValue="lines" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-sidebar border border-border">
          <TabsTrigger value="lines">{t('lines')}</TabsTrigger>
          <TabsTrigger value="equipment">{t('equipment')}</TabsTrigger>
          <TabsTrigger value="downtimes">{t('downtimes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="mt-6">
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

        <TabsContent value="downtimes" className="mt-6">
          <Card className="p-6 bg-card border-border">
            <DowntimeCategoriesTab />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
