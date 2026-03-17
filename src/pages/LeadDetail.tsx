import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Copy, Send, Sparkles, Mail, Phone, Building2, User, Globe, Clock, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useCustomFields } from "@/hooks/useSettings";
import { useLeadDetail } from "@/hooks/useCampaigns"; // I added it there earlier
import { useLeads, useFunnelStages } from "@/hooks/useLeads";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/useWorkspaces";
import { useCampaigns, useGeneratedMessages, useMarkAsSent } from "@/hooks/useCampaigns";
import { generateSDRMessages } from "@/lib/aiService";
import { useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const { data: lead, isLoading: isLoadingLead } = useLeadDetail(id);
  const queryClient = useQueryClient();
  const leadWorkspaceId = lead?.workspace_id || currentWorkspace?.id;
  const isAdmin = currentWorkspace?.role === 'admin';
  
  const { data: allMessages = [], isLoading: isLoadingMessages } = useGeneratedMessages(id);
  const { updateStage, updateAssignment, deleteLead } = useLeads(leadWorkspaceId);
  const { data: stages = [] } = useFunnelStages(leadWorkspaceId);
  const { data: campaigns = [] } = useCampaigns(leadWorkspaceId);
  const { data: members = [] } = useWorkspaceMembers(leadWorkspaceId);
  const { data: customFields = [] } = useCustomFields(leadWorkspaceId);
  const { mutateAsync: markAsSent } = useMarkAsSent(id, leadWorkspaceId);
  
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageToSend, setMessageToSend] = useState<{ text: string; index: number } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Auto-select latest campaign if messages exist
  // We want to auto-select if:
  // 1. No campaign is selected yet
  // 2. A NEW generation just finished (the first message's ID has changed)
  useEffect(() => {
    if (allMessages.length > 0) {
      const latestCampaignId = allMessages[0].campaign_id;
      if (!selectedCampaignId || allMessages[0].id !== queryClient.getQueryData(['last_seen_msg_id_' + id])) {
        setSelectedCampaignId(latestCampaignId);
        queryClient.setQueryData(['last_seen_msg_id_' + id], allMessages[0].id);
      }
    }
  }, [allMessages, id, queryClient]);

  const handleStageChange = async (newStageId: string) => {
    try {
      await updateStage({ leadId: lead.id, stageId: newStageId });
      
      // Look for automatic triggers for this specific stage
      const triggerCampaigns = campaigns.filter(c => c.trigger_stage_id === newStageId);
      
      if (triggerCampaigns.length > 0) {
        toast.info(`Automatizando as mensagens com IA para ${lead.name}...`);
        for (const campaign of triggerCampaigns) {
          try {
            await generateSDRMessages(lead, campaign);
            queryClient.invalidateQueries({ queryKey: ["generated_messages", id] });
          } catch (e) {
            console.error("Auto-generation error:", e);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const currentMessages = allMessages.find(m => m.campaign_id === selectedCampaignId)?.messages || [];

  if (isLoadingLead) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p className="text-lg">Lead não encontrado.</p>
        <Button variant="ghost" onClick={() => navigate("/leads")} className="mt-4">Voltar para Leads</Button>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!selectedCampaignId) {
      toast.error("Selecione uma campanha primeiro");
      return;
    }
    
    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    if (!campaign) return;

    setIsGenerating(true);
    try {
      await generateSDRMessages(lead, campaign);
      queryClient.invalidateQueries({ queryKey: ["generated_messages", id] });
      toast.success("Mensagens geradas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Falha ao gerar mensagens");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (msg: string) => {
    navigator.clipboard.writeText(msg);
    toast.success("Copiado para a área de transferência");
  };


  const handleConfirmSend = async () => {
    if (!messageToSend) return;
    
    try {
      const targetStage = stages.find(s => s.name === "Tentando Contato");
      const currentGeneratedMsg = allMessages.find(m => m.campaign_id === selectedCampaignId);

      if (currentGeneratedMsg) {
        await markAsSent({
          messageId: currentGeneratedMsg.id,
          campaignId: selectedCampaignId,
          index: messageToSend.index
        });
      }

      if (targetStage && lead.stage_id !== targetStage.id) {
        await updateStage({ leadId: lead.id, stageId: targetStage.id });
      } else {
        toast.success("Tentativa de contato registrada! Persistência é a chave. 🚀");
      }
      
      setMessageToSend(null);
    } catch (error: any) {
      toast.error("Falha ao registrar ação");
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      await deleteLead(lead.id);
      navigate("/leads");
    } catch (error) {
      console.error(error);
    }
  };

  const initials = lead.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-hidden">
      <PageHeader 
        title={lead.name}
        description={`Detalhes e inteligência do lead na empresa ${lead.company || '—'}.`}
      >
        <Button variant="ghost" onClick={() => navigate("/leads")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-background/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left: Lead Info */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Header Card */}
              <Card className="p-4 sm:p-8 glass-card border-border relative group">
                <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6 sm:gap-8 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-primary/10">
                      <AvatarFallback className="bg-primary/20 text-primary text-xl sm:text-2xl font-black">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-['Syne'] mb-1 sm:mb-2">{lead.name}</h1>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-[10px] sm:text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-muted rounded-lg border border-border">
                          <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" /> {lead.company}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-muted rounded-lg border border-border">
                          <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" /> {lead.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                    <div className="space-y-1.5 w-full sm:w-40">
                      <Label className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-bold ml-1">Etapa</Label>
                      <Select value={lead.stage_id} onValueChange={handleStageChange}>
                        <SelectTrigger className="w-full bg-muted border-border h-10 sm:h-11 rounded-xl font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5 w-full sm:w-40">
                      <Label className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-bold ml-1">Responsável</Label>
                      <Select 
                        value={(lead.assigned_to as string) || "_unassigned"} 
                        onValueChange={(v: string) => updateAssignment({ leadId: lead.id, userId: v === "_unassigned" ? null : v })}
                        disabled={isLoadingLead}
                      >
                        <SelectTrigger className="w-full bg-muted border-border h-10 sm:h-11 rounded-xl font-bold">
                          <SelectValue placeholder={isLoadingLead ? "Carregando..." : "Atribuir..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {members.length === 0 ? (
                            <SelectItem value="_loading" disabled>Carregando membros...</SelectItem>
                          ) : (
                            <>
                              <SelectItem value="_unassigned">Sem responsável</SelectItem>
                              {members.map((m) => (
                                <SelectItem key={m.user_id} value={m.user_id}>
                                  {m.profiles?.full_name || m.profiles?.email?.split('@')[0] || 'Usuário'}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Details */}
                <Card className="p-4 sm:p-6 glass-card border-border">
                  <h2 className="text-[10px] sm:text-[11px] font-black text-primary uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Inteligência de Contato
                  </h2>
                  <div className="space-y-4 sm:space-y-5">
                    <InfoRow icon={Mail} label="E-mail" value={lead.email || "—"} />
                    <InfoRow icon={Phone} label="Telefone" value={lead.phone || "—"} />
                    <InfoRow icon={Globe} label="Origem" value={lead.origin || "—"} />
                    <InfoRow icon={Clock} label="Capturado" value={formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })} />
                  </div>
                </Card>

                {/* Custom Fields */}
                <Card className="p-4 sm:p-6 glass-card border-border">
                  <h2 className="text-[10px] sm:text-[11px] font-black text-primary uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Dados de Discovery
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    {lead.custom_data && Object.keys(lead.custom_data).length > 0 ? (
                      Object.entries(lead.custom_data).map(([key, value]) => {
                        const fieldDef = customFields.find((f: any) => f.field_key === key);
                        const label = fieldDef ? fieldDef.name : key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                        
                        return (
                          <div key={key} className="p-2 sm:p-3 bg-muted rounded-xl border border-border">
                            <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase font-black tracking-wider mb-1">
                              {label}
                            </p>
                            <p className="text-xs sm:text-sm text-foreground font-medium">{String(value) || "—"}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 sm:py-8 bg-muted rounded-2xl border border-dashed border-border/10">
                        <p className="text-[10px] sm:text-xs text-muted-foreground italic">Nenhum dado capturado.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Notes */}
              <Card className="p-4 sm:p-6 glass-card border-white/5">
                <h2 className="text-[10px] sm:text-[11px] font-black text-primary uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Notas Estratégicas
                </h2>
                <div className="p-4 sm:p-5 bg-muted/60 rounded-xl sm:rounded-2xl border border-border min-h-[100px] sm:min-h-[120px]">
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed italic opacity-80">{lead.notes || "Sem notas estratégicas."}</p>
                </div>
              </Card>

              {/* Danger Zone */}
              {isAdmin && (
                <Card className="p-4 sm:p-6 border-destructive/20 bg-destructive/5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="text-[10px] sm:text-[11px] font-black text-destructive uppercase tracking-widest mb-1 flex items-center gap-2">
                         Zona de Risco
                      </h2>
                      <p className="text-xs text-muted-foreground">Excluir permanentemente este lead e todo o seu histórico.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-full sm:w-auto border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all font-bold gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir Lead
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Right: AI Generator */}
            <div className="lg:col-span-1">
              <Card className="p-6 sm:p-8 glass-card border-primary/20 lg:sticky lg:top-8 relative">
                <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </div>
                
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Inteligência SDR</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Gemini Flash</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-bold ml-1">Campanha Ativa</Label>
                    <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                      <SelectTrigger className="bg-card border-border h-10 sm:h-12 rounded-xl font-bold">
                        <SelectValue placeholder="Escolha uma campanha..." />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.length > 0 ? (
                          campaigns.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="_no_campaign" disabled>Nenhuma campanha ativa</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || campaigns.length === 0}
                    className="w-full bg-primary text-black font-black hover:bg-primary/95 h-12 sm:h-14 rounded-xl sm:rounded-2xl shadow-glow transition-all active:scale-[0.98]"
                  >
                    {isGenerating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gerando...</> : "Gerar Abordagem"}
                  </Button>

                  {currentMessages.length > 0 && (
                    <div className="space-y-4 mt-6 sm:mt-8 animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-[1px] flex-1 bg-border" />
                        <span className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-tight">Sugestões</span>
                        <div className="h-[1px] flex-1 bg-border" />
                      </div>
                      
                      {currentMessages.map((msg: string, i: number) => (
                        <Card key={i} className="p-4 sm:p-5 bg-muted border-border text-[13px] sm:text-sm leading-relaxed text-foreground rounded-xl sm:rounded-2xl group relative">
                          <p className="opacity-90">{msg}</p>
                          <div className="flex justify-end gap-2 mt-4 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                            <Button size="sm" variant="ghost" className="h-8 text-[10px] sm:text-[11px] gap-2 text-muted-foreground font-bold" onClick={() => handleCopy(msg)}>
                              <Copy className="h-3.5 w-3.5" /> Copiar
                            </Button>
                            <Button size="sm" className="h-8 text-[10px] sm:text-[11px] gap-2 bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 font-bold" onClick={() => {
                              setMessageToSend({ text: msg, index: i });
                            }}>
                              <Send className="h-3.5 w-3.5" /> Usar
                            </Button>
                          </div>
                        </Card>
                      ))}

                      <Button 
                        variant="ghost" 
                        onClick={handleGenerate} 
                        disabled={isGenerating} 
                        className="w-full mt-2 gap-2 text-muted-foreground text-[10px] sm:text-xs font-bold"
                      >
                        <RefreshCcw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                        Novas opções
                      </Button>
                    </div>
                  )}

                  {isLoadingMessages && !isGenerating && (
                    <div className="flex justify-center py-8">
                       <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                    </div>
                  )}

                  {campaigns.length === 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-[10px] text-yellow-500 font-bold text-center leading-tight">
                        Crie uma campanha para liberar o gerador de IA.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!messageToSend} onOpenChange={(o) => !o && setMessageToSend(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-['Syne'] text-foreground">Enviar Mensagem</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Confirme o envio da abordagem para {lead?.name}. O lead será movido para "Tentando Contato" automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-5 px-6 bg-muted border border-border rounded-2xl text-sm mt-4 text-foreground/90 leading-relaxed italic">
             "{messageToSend?.text}"
          </div>
          <DialogFooter className="mt-8 gap-3">
            <Button variant="ghost" onClick={() => setMessageToSend(null)} className="font-bold">Cancelar</Button>
            <Button onClick={handleConfirmSend} className="gap-2 bg-primary text-black font-black hover:bg-primary/95 shadow-glow px-6 h-12 rounded-xl">
              <Send className="h-4 w-4" /> Confirmar e Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" /> Excluir Lead
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              Você tem certeza que deseja excluir <strong>{lead.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="ghost" className="text-muted-foreground font-bold" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button className="bg-destructive text-white font-bold hover:bg-destructive/90" onClick={handleDelete} >
              Sim, Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center border border-border transition-colors group-hover:border-primary/30">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
