import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Plug, 
  Plus, 
  Settings, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Edit, 
  Trash2, 
  PlayCircle,
  BarChart3,
  Link2,
  Clock,
  Zap
} from "lucide-react";
import { format } from "date-fns";

type IntegrationStatus = "active" | "waiting" | "error" | "inactive";

interface Integration {
  id: number;
  name: string;
  type: "SCADA" | "MES" | "ERP" | "Custom";
  endpoint_url: string;
  sync_frequency_min: number;
  status: IntegrationStatus;
  active: boolean;
  last_sync?: string;
  error_message?: string;
}

interface LineAssignment {
  id: number;
  id_line: number;
  line_name: string;
  id_integration: number;
  integration_name: string;
  active: boolean;
}

interface IntegrationLog {
  id: number;
  id_integration: number;
  integration_name: string;
  timestamp: string;
  result: "success" | "failure";
  latency_ms: number;
  error_message?: string;
}

const mockIntegrations: Integration[] = [
  {
    id: 1,
    name: "SCADA Principal",
    type: "SCADA",
    endpoint_url: "https://scada.factory.com/api/v1/data",
    sync_frequency_min: 5,
    status: "active",
    active: true,
    last_sync: "2025-11-07 14:30:00",
  },
  {
    id: 2,
    name: "MES Integration",
    type: "MES",
    endpoint_url: "https://mes.factory.com/api/oee",
    sync_frequency_min: 15,
    status: "waiting",
    active: true,
    last_sync: "2025-11-07 14:15:00",
  },
  {
    id: 3,
    name: "ERP Connector",
    type: "ERP",
    endpoint_url: "https://erp.factory.com/production/sync",
    sync_frequency_min: 60,
    status: "error",
    active: true,
    last_sync: "2025-11-07 13:00:00",
    error_message: "Connection timeout after 30s",
  },
  {
    id: 4,
    name: "Custom API",
    type: "Custom",
    endpoint_url: "https://api.custom.com/metrics",
    sync_frequency_min: 10,
    status: "inactive",
    active: false,
  },
];

export default function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isNewIntegration, setIsNewIntegration] = useState(false);

  const getStatusConfig = (status: IntegrationStatus) => {
    switch (status) {
      case "active":
        return { icon: CheckCircle, color: "text-status-good", bg: "bg-status-good/10", label: "Activo" };
      case "waiting":
        return { icon: Clock, color: "text-status-warning", bg: "bg-status-warning/10", label: "Esperando" };
      case "error":
        return { icon: AlertCircle, color: "text-status-critical", bg: "bg-status-critical/10", label: "Error" };
      case "inactive":
        return { icon: Activity, color: "text-status-offline", bg: "bg-status-offline/10", label: "Inactivo" };
    }
  };

  const handleTestConnection = async (integration: Integration) => {
    toast({
      title: "Probando conexión...",
      description: `Conectando a ${integration.name}`,
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Conexión exitosa",
      description: `${integration.name} respondió correctamente`,
    });
  };

  const handleSaveIntegration = () => {
    if (!selectedIntegration) return;

    if (isNewIntegration) {
      setIntegrations([...integrations, { ...selectedIntegration, id: Date.now() }]);
      toast({
        title: "Integración creada",
        description: `${selectedIntegration.name} se agregó correctamente`,
      });
    } else {
      setIntegrations(
        integrations.map(i => i.id === selectedIntegration.id ? selectedIntegration : i)
      );
      toast({
        title: "Integración actualizada",
        description: `${selectedIntegration.name} se actualizó correctamente`,
      });
    }

    setIsConfigDialogOpen(false);
    setSelectedIntegration(null);
  };

  const handleDeleteIntegration = (id: number) => {
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      setIntegrations(integrations.filter(i => i.id !== id));
      toast({
        title: "Integración eliminada",
        description: `${integration.name} se eliminó correctamente`,
      });
    }
  };

  const openNewIntegrationDialog = () => {
    setSelectedIntegration({
      id: 0,
      name: "",
      type: "SCADA",
      endpoint_url: "",
      sync_frequency_min: 5,
      status: "inactive",
      active: false,
    });
    setIsNewIntegration(true);
    setIsConfigDialogOpen(true);
  };

  const openEditIntegrationDialog = (integration: Integration) => {
    setSelectedIntegration({ ...integration });
    setIsNewIntegration(false);
    setIsConfigDialogOpen(true);
  };

  // Calculate stats
  const activeCount = integrations.filter(i => i.status === "active").length;
  const errorCount = integrations.filter(i => i.status === "error").length;
  const avgLatency = 85; // Mock value

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Panel de Integraciones</h1>
          <p className="text-muted-foreground">
            Gestión y monitoreo de integraciones activas con sistemas externos
          </p>
        </div>
        <Button onClick={openNewIntegrationDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Integración
        </Button>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-status-good/10">
              <Zap className="h-6 w-6 text-status-good" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Integraciones Activas</p>
              <p className="text-3xl font-bold text-foreground">{activeCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-status-critical/10">
              <AlertCircle className="h-6 w-6 text-status-critical" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Errores Detectados</p>
              <p className="text-3xl font-bold text-foreground">{errorCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Latencia Promedio</p>
              <p className="text-3xl font-bold text-foreground">{avgLatency}ms</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="catalog" className="gap-2">
            <Plug className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger value="assignment" className="gap-2">
            <Link2 className="h-4 w-4" />
            Asignación
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="h-4 w-4" />
            Registros
          </TabsTrigger>
        </TabsList>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <Card className="border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">URL</TableHead>
                    <TableHead className="font-semibold text-center">Frecuencia</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Última Sync</TableHead>
                    <TableHead className="font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => {
                    const statusConfig = getStatusConfig(integration.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <TableRow key={integration.id} className="border-border hover:bg-muted/30">
                        <TableCell className="font-medium">{integration.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{integration.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono max-w-xs truncate">
                          {integration.endpoint_url}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{integration.sync_frequency_min} min</Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${statusConfig.bg} px-3 py-1 rounded-full w-fit`}>
                            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                            <span className={`text-sm font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          {integration.error_message && (
                            <p className="text-xs text-status-critical mt-1">{integration.error_message}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {integration.last_sync ? format(new Date(integration.last_sync), "dd/MM/yyyy HH:mm") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTestConnection(integration)}
                              className="gap-1"
                            >
                              <PlayCircle className="h-4 w-4" />
                              Probar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditIntegrationDialog(integration)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIntegration(integration.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Assignment Tab */}
        <TabsContent value="assignment">
          <Card className="p-6 bg-card border-border">
            <p className="text-center text-muted-foreground py-8">
              Asignación de integraciones a líneas de producción (próximamente)
            </p>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card className="p-6 bg-card border-border">
            <p className="text-center text-muted-foreground py-8">
              Registro de actividad de integraciones (próximamente)
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isNewIntegration ? "Nueva Integración" : "Editar Integración"}
            </DialogTitle>
            <DialogDescription>
              Configure los detalles de la integración con el sistema externo
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={selectedIntegration.name}
                    onChange={(e) =>
                      setSelectedIntegration({ ...selectedIntegration, name: e.target.value })
                    }
                    placeholder="Ej: SCADA Principal"
                    className="bg-sidebar border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={selectedIntegration.type}
                    onValueChange={(value: any) =>
                      setSelectedIntegration({ ...selectedIntegration, type: value })
                    }
                  >
                    <SelectTrigger className="bg-sidebar border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      <SelectItem value="SCADA">SCADA</SelectItem>
                      <SelectItem value="MES">MES</SelectItem>
                      <SelectItem value="ERP">ERP</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint URL *</Label>
                <Input
                  id="endpoint"
                  value={selectedIntegration.endpoint_url}
                  onChange={(e) =>
                    setSelectedIntegration({ ...selectedIntegration, endpoint_url: e.target.value })
                  }
                  placeholder="https://api.sistema.com/v1/data"
                  className="bg-sidebar border-border font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia de Sincronización (minutos) *</Label>
                <Input
                  id="frequency"
                  type="number"
                  min="1"
                  value={selectedIntegration.sync_frequency_min}
                  onChange={(e) =>
                    setSelectedIntegration({
                      ...selectedIntegration,
                      sync_frequency_min: parseInt(e.target.value) || 5,
                    })
                  }
                  className="bg-sidebar border-border"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedIntegration.active}
                  onCheckedChange={(checked) =>
                    setSelectedIntegration({ ...selectedIntegration, active: checked })
                  }
                />
                <Label className="cursor-pointer">Integración activa</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfigDialogOpen(false);
                setSelectedIntegration(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveIntegration}>
              {isNewIntegration ? "Crear" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
