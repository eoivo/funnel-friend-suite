import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Loader2, Zap, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCampaignMutation } from "@/hooks/useCampaigns";

import { PageHeader } from "@/components/PageHeader";

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const { data: campaigns = [], isLoading } = useCampaigns(currentWorkspace?.id);
  const { deleteCampaign } = useCampaignMutation(currentWorkspace?.id);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <PageHeader 
        title="Campanhas" 
        description="Sequências de prospecção alimentadas por IA"
      >
        <Button onClick={() => navigate("/campaigns/new")} className="gap-2 bg-primary text-black font-black hover:bg-primary/90 rounded-xl shadow-glow px-6 h-10 transition-all hover:scale-105 active:scale-95">
          <Plus className="h-5 w-5" /> Nova Campanha
        </Button>
      </PageHeader>

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-4">

      <div className="space-y-3 sm:space-y-4">
        {campaigns.length === 0 ? (
          <Card className="p-10 sm:p-20 text-center border-dashed border-2 flex flex-col items-center gap-4 sm:gap-6 bg-background/40 border-border rounded-2xl sm:rounded-3xl">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow">
              <Send className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="space-y-2">
                <p className="text-lg sm:text-xl font-bold text-foreground">Lance sua primeira campanha</p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">Crie sequências de prospecção e utilize o Gemini para personalizar sua abordagem.</p>
            </div>
            <Button className="mt-2 sm:mt-4 bg-primary text-black font-bold hover:bg-primary/90 rounded-xl px-6 sm:px-8 h-10 sm:h-12 shadow-glow" onClick={() => navigate("/campaigns/new")}>
              <Plus className="h-4 w-4 mr-2" /> Nova Campanha
            </Button>
          </Card>
        ) : (
          campaigns.map((c) => (
            <Card
              key={c.id}
              onClick={() => navigate(`/campaigns/${c.id}`)}
              className="p-4 sm:p-6 glass-card shadow-sdr-sm border-border/50 cursor-pointer transition-all hover:border-primary/20 rounded-xl sm:rounded-2xl group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 transition-all group-hover:bg-primary/20">
                    <Send className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">{c.name}</p>
                    <div className="flex items-center gap-2 text-[9px] sm:text-[11px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5 sm:mt-1">
                      <Zap className="h-3 w-3 text-primary" />
                      Gatilho: <span className="text-primary/70">{c.trigger_stage_name || 'Manual'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                  <Badge
                    variant={c.is_active ? "default" : "secondary"}
                    className={c.is_active 
                      ? "bg-primary text-black border-none font-black text-[9px] sm:text-[10px] uppercase px-3 py-1 rounded-full shadow-glow" 
                      : "bg-muted/50 text-muted-foreground font-bold text-[9px] sm:text-[10px] uppercase px-3 py-1 rounded-full"}
                  >
                    {c.is_active ? 'Ativa' : 'Rascunho'}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                    <div className="flex items-center gap-1 transition-all">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/campaigns/${c.id}`);
                        }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCampaignToDelete(c.id);
                        }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        ))}
      </div>

      <Dialog open={!!campaignToDelete} onOpenChange={(o) => !o && setCampaignToDelete(null)}>
        <DialogContent className="bg-card border-border max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" /> Excluir Campanha
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              Você tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita e falhará se houverem leads vinculados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="ghost" className="text-muted-foreground font-bold" onClick={() => setCampaignToDelete(null)}>
              Cancelar
            </Button>
            <Button 
              className="bg-destructive text-white font-bold hover:bg-destructive/90" 
              onClick={async () => {
                if (campaignToDelete) {
                  try {
                    await deleteCampaign.mutateAsync(campaignToDelete);
                    setCampaignToDelete(null);
                  } catch (e) {
                    // Error handled in hook/toast
                  }
                }
              }}
            >
              Sim, Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
);
}
