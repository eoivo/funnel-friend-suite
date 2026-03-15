import { useState, useMemo } from "react";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useFunnelStages } from "@/hooks/useLeads";
import { useCustomFields, useRequiredFields } from "@/hooks/useSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageHeader } from "@/components/PageHeader";

const STANDARD_FIELDS = ["name", "email", "phone", "company", "role", "origin"];

export default function SettingsPage() {
  const { currentWorkspace } = useWorkspaces();
  const { data: stages = [], isLoading: isLoadingStages } = useFunnelStages(currentWorkspace?.id);
  const { data: customFields = [], addField, removeField, isLoading: isLoadingFields } = useCustomFields(currentWorkspace?.id);
  const { data: requiredFields = [], toggleRequired } = useRequiredFields(currentWorkspace?.id);
  
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "select">("text");

  const handleAddField = async () => {
    if (!currentWorkspace) return;
    if (!newFieldName.trim()) {
      toast.error("O nome do campo é obrigatório");
      return;
    }
    await addField.mutateAsync({
      workspace_id: currentWorkspace.id,
      name: newFieldName,
      field_key: newFieldName.toLowerCase().replace(/\s+/g, "_"),
      field_type: newFieldType,
    });
    setNewFieldName("");
  };

  const handleToggleRequired = async (stageId: string, fieldName: string) => {
    const isCurrentlyRequired = requiredFields.some(r => r.stage_id === stageId && r.field_name === fieldName);
    await toggleRequired.mutateAsync({
      stageId,
      fieldName,
      isRequired: !isCurrentlyRequired
    });
  };

  const allFieldNames = useMemo(() => {
    return [...STANDARD_FIELDS, ...customFields.map((f) => f.field_key)];
  }, [customFields]);

  if (isLoadingStages || isLoadingFields) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <PageHeader 
        title="Configurações" 
        description="Configure descoberta de leads, etapas do funil e qualidade de dados."
      />

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">

      <Tabs defaultValue="fields" className="w-full">
        <TabsList className="bg-muted/60 backdrop-blur-md border border-border p-1 mb-6 sm:mb-10 rounded-xl sm:rounded-2xl h-auto flex flex-wrap gap-1">
          <TabsTrigger value="fields" className="flex-1 rounded-lg sm:rounded-xl px-2 sm:px-8 h-10 sm:h-12 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold transition-all whitespace-nowrap">Campos</TabsTrigger>
          <TabsTrigger value="stages" className="flex-1 rounded-lg sm:rounded-xl px-2 sm:px-8 h-10 sm:h-12 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold transition-all whitespace-nowrap">Etapas</TabsTrigger>
          <TabsTrigger value="required" className="flex-1 rounded-lg sm:rounded-xl px-2 sm:px-8 h-10 sm:h-12 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold transition-all whitespace-nowrap">Obrigatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="fields">
          <Card className="p-4 sm:p-8 glass-card border-border rounded-2xl sm:rounded-3xl">
            <h2 className="text-[10px] sm:text-[11px] font-black text-primary/80 uppercase tracking-widest mb-6 sm:mb-8">Configuração de Descoberta</h2>
            <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-10">
              {customFields.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-muted/10 border border-dashed border-border/10 rounded-xl sm:rounded-2xl">
                    <p className="text-xs sm:text-sm text-muted-foreground italic">Nenhum campo personalizado.</p>
                </div>
              ) : (
                customFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl bg-muted border border-border">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">{field.name}</span>
                      <Badge variant="outline" className="text-[8px] sm:text-[10px] font-black uppercase border-primary/30 text-primary bg-primary/10 px-2 py-0.1 sm:py-0.5 rounded-full">{field.field_type}</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-destructive rounded-lg sm:rounded-xl" 
                      onClick={() => removeField.mutate(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex flex-col md:grid md:grid-cols-[1fr,200px,auto] gap-4 sm:gap-6 items-end border-t border-border pt-8 sm:pt-10">
              <div className="space-y-2 sm:space-y-3 w-full">
                <Label className="text-[10px] sm:text-[11px] text-muted-foreground uppercase font-black tracking-widest ml-1">Rótulo do Campo</Label>
                <Input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="bg-muted/30 border-border h-10 sm:h-12 rounded-xl focus:ring-primary/20" placeholder="Ex: Mercado Alvo" />
              </div>
              <div className="space-y-2 sm:space-y-3 w-full">
                <Label className="text-[10px] sm:text-[11px] text-muted-foreground uppercase font-black tracking-widest ml-1">Tipo de Dado</Label>
                <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as "text" | "number" | "select")}>
                  <SelectTrigger className="bg-muted/30 border-border h-10 sm:h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Numérico</SelectItem>
                    <SelectItem value="select">Seleção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddField} className="h-10 sm:h-12 w-full md:w-auto px-8 gap-2 bg-primary text-black font-black hover:bg-primary/90 shadow-glow rounded-xl">
                <Plus className="h-5 w-5" /> Adicionar
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <Card className="p-4 sm:p-8 glass-card border-border rounded-2xl sm:rounded-3xl">
            <h2 className="text-[10px] sm:text-[11px] font-black text-primary/80 uppercase tracking-widest mb-6 sm:mb-8">Funil de Vendas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {stages.map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-3 sm:gap-5 py-3 px-4 sm:py-5 sm:px-6 rounded-xl sm:rounded-2xl bg-muted border border-border">
                  <span className="text-xs sm:text-sm font-black text-primary tabular-nums h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">{i + 1}</span>
                  <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">{stage.name}</span>
                  <div className="flex items-center gap-2 ml-auto bg-background/40 px-2 py-1 rounded-lg border border-border">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">{stage.color}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="required">
          <Card className="p-4 sm:p-8 glass-card border-border rounded-2xl sm:rounded-3xl">
            <h2 className="text-[10px] sm:text-[11px] font-black text-primary/80 uppercase tracking-widest mb-6 sm:mb-8">Qualidade de Dados</h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-xs sm:text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 pr-4 sm:pr-8 text-[9px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-widest">Etapa</th>
                    {allFieldNames.map((f) => (
                      <th key={f} className="text-center py-4 px-2 sm:px-4 text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                        {f === "name" ? "Nome" : 
                         f === "email" ? "E-mail" : 
                         f === "phone" ? "Tel" : 
                         f === "company" ? "Empresa" : 
                         f === "role" ? "Cargo" : 
                         f === "origin" ? "Origem" : f.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stages.map((stage) => (
                    <tr key={stage.id} className="group hover:bg-muted transition-colors">
                      <td className="py-4 pr-4 sm:pr-8 text-xs sm:text-sm text-foreground font-bold">{stage.name}</td>
                      {allFieldNames.map((field) => (
                        <td key={field} className="text-center py-4 px-2 sm:px-4">
                          <Checkbox
                            className="border-border h-4 w-4 sm:h-5 sm:w-5 rounded-md"
                            checked={requiredFields.some(r => r.stage_id === stage.id && r.field_name === field)}
                            onCheckedChange={() => handleToggleRequired(stage.id, field)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
                <div className="flex items-center gap-3 text-muted-foreground/60">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-tight">Campos obrigatórios barram a mudança de etapa.</p>
                </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
);
}
