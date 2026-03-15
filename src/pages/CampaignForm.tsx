import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useFunnelStages } from "@/hooks/useLeads";
import { useCampaigns, useCampaignMutation } from "@/hooks/useCampaigns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";

export default function CampaignFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const { data: campaigns = [], isLoading: isLoadingCaps } = useCampaigns(currentWorkspace?.id);
  const { data: stages = [] } = useFunnelStages(currentWorkspace?.id);
  const { createCampaign, updateCampaign } = useCampaignMutation(currentWorkspace?.id);

  const existing = id ? campaigns.find((c) => c.id === id) : null;
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    context: "",
    generation_prompt: "",
    trigger_stage_id: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "",
        context: existing.context || "",
        generation_prompt: existing.generation_prompt || "",
        trigger_stage_id: existing.trigger_stage_id || "",
      });
    }
  }, [existing]);

  const handleSave = async () => {
    if (!currentWorkspace) return;
    if (!form.name.trim()) {
      toast.error("O nome da campanha é obrigatório");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        context: form.context,
        generation_prompt: form.generation_prompt,
        trigger_stage_id: form.trigger_stage_id || null, // Ensure null if empty
      };

      if (isEdit && id) {
        await updateCampaign.mutateAsync({ 
          id, 
          updates: payload 
        });
        toast.success("Campanha atualizada!");
      } else {
        await createCampaign.mutateAsync({
          workspace_id: currentWorkspace.id,
          ...payload,
          is_active: true
        });
        toast.success("Campanha criada!");
      }
      navigate("/campaigns");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Falha ao salvar campanha");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoadingCaps) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <PageHeader 
        title={isEdit ? "Editar Campanha" : "Nova Campanha"} 
        description="Configure como a IA deve gerar mensagens personalizadas para seus leads."
      >
        <Button variant="ghost" onClick={() => navigate("/campaigns")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </PageHeader>      <div className="p-4 sm:p-8 max-w-4xl w-full mx-auto">
        <Card className="p-4 sm:p-8 glass-card border-border shadow-sdr-sm">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Nome da Campanha</Label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="bg-muted/80 border-border h-10 sm:h-12 rounded-xl focus:ring-primary/20 transition-all font-medium text-sm" 
                placeholder="Ex: Cold Outreach" 
              />
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Contexto</Label>
              <Textarea 
                value={form.context} 
                onChange={(e) => setForm({ ...form, context: e.target.value })} 
                className="bg-muted/80 border-border min-h-[80px] sm:min-h-[100px] rounded-xl focus:ring-primary/20 transition-all text-sm" 
                placeholder="Descreva o público-alvo..." 
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Prompt da IA</Label>
              <Textarea 
                value={form.generation_prompt} 
                onChange={(e) => setForm({ ...form, generation_prompt: e.target.value })} 
                className="bg-muted/80 border-border min-h-[120px] sm:min-h-[140px] rounded-xl focus:ring-primary/20 transition-all font-mono text-xs sm:text-sm leading-relaxed" 
                placeholder="Como a IA deve se comportar..." 
              />
              <div className="flex items-center gap-2 mt-1 sm:mt-2 ml-1">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-tight font-bold">Variáveis: {"{{name}}"}, {"{{company}}"}</p>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 border-t border-border pt-4 sm:pt-6">
              <Label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Gatilho (Opcional)</Label>
              <Select value={form.trigger_stage_id} onValueChange={(v) => setForm({ ...form, trigger_stage_id: v })}>
                <SelectTrigger className="bg-muted/80 border-border h-10 sm:h-12 rounded-xl font-bold text-sm">
                  <SelectValue placeholder="Selecione uma etapa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_no_trigger">Sem gatilho automático</SelectItem>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 bg-primary text-black font-black hover:bg-primary/95 h-12 sm:h-14 rounded-xl sm:rounded-2xl shadow-glow transition-all active:scale-[0.98]"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEdit ? "Salvar Alterações" : "Criar Campanha")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/campaigns")} className="h-12 sm:h-14 px-8 rounded-xl sm:rounded-2xl border-border font-bold">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
