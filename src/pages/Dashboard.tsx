import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useLeads, useFunnelStages } from "@/hooks/useLeads";
import { useActivities } from "@/hooks/useActivities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Send, Users, TrendingUp, Activity, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

import { PageHeader } from "@/components/PageHeader";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentWorkspace, isLoading: isLoadingWS } = useWorkspaces();
  const { leads, isLoading: isLoadingLeads } = useLeads(currentWorkspace?.id);
  const { data: stages = [] } = useFunnelStages(currentWorkspace?.id);
  const { data: activities = [] } = useActivities(currentWorkspace?.id);

  const stats = useMemo(() => {
    const total = leads.length;
    // Common stages names for global stats
    const qualifiedCount = leads.filter(l => l.stage_name === "Qualificado" || l.stage_name === "Reunião Agendada").length;
    const outreachCount = leads.filter(l => l.stage_name === "Tentando Contato").length;
    const meetingsCount = leads.filter(l => l.stage_name === "Reunião Agendada").length;

    const funnelData = stages.map(stage => ({
      name: stage.name,
      count: leads.filter(l => l.stage_id === stage.id).length
    }));

    const max = Math.max(...funnelData.map(s => s.count), 1);

    return { total, qualifiedCount, outreachCount, meetingsCount, funnelData, max };
  }, [leads, stages]);

  if (isLoadingWS || isLoadingLeads) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <PageHeader 
        title="Dashboard" 
        description={`Converta mais leads, mais rápido em ${currentWorkspace?.name || 'seu workspace'}.`}
      >
        <Button variant="secondary" onClick={() => navigate("/campaigns/new")} className="gap-2 font-bold h-10 px-5 border-border/50 rounded-xl">
          <Send className="h-4 w-4" /> Nova Campanha
        </Button>
        <Button onClick={() => navigate("/leads")} className="gap-2 bg-primary text-black font-bold hover:bg-primary/90 shadow-glow h-10 px-5 rounded-xl">
          <Plus className="h-4 w-4" /> Adicionar Lead
        </Button>
      </PageHeader>

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Leads", value: stats.total, icon: Users, color: "primary" },
          { label: "Qualificados", value: stats.qualifiedCount, icon: TrendingUp, color: "primary" },
          { label: "Prospecção", value: stats.outreachCount, icon: Send, color: "primary" },
          { label: "Reuniões", value: stats.meetingsCount, icon: Activity, color: "primary" },
        ].map((stat) => (
          <Card key={stat.label} className="p-3 sm:p-4 glass-card shadow-sdr-sm border-border/50 transition-all hover:border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold tabular-nums text-foreground tracking-tight truncate">{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-muted-foreground tracking-wider truncate">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Funnel + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel Bar Chart */}
        <Card className="col-span-1 lg:col-span-2 p-4 sm:p-5 bg-card border-border shadow-sdr-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground">Visão Geral do Funil</h2>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden xs:flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] text-muted-foreground">Volume</span>
              </div>
              <div className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                Conv: {stats.total > 0 ? ((stats.meetingsCount / stats.total) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats.funnelData.map((stage, i) => {
              const prevStage = stats.funnelData[i - 1];
              const conversion = prevStage && prevStage.count > 0 
                ? ((stage.count / prevStage.count) * 100).toFixed(0) 
                : null;

              return (
                <div key={stage.name} className="space-y-1">
                  {conversion !== null && (
                    <div className="flex justify-center -mt-2 mb-1">
                      <div className="text-[8px] sm:text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
                        ↓ {conversion}% conv.
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[10px] sm:text-xs text-muted-foreground w-20 sm:w-32 truncate">{stage.name}</span>
                    <div className="flex-1 h-6 sm:h-7 bg-muted/50 rounded-md overflow-hidden relative border border-border/20">
                      <div
                        className="h-full bg-primary/70 rounded-sm transition-all duration-500 ease-out"
                        style={{ width: `${(stage.count / stats.max) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      {stage.count > 0 && (
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-foreground/80">
                          {stage.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 sm:p-5 bg-card border-border shadow-sdr-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground">Atividade Recente</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-8 px-2" onClick={() => navigate("/leads")}>
              Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-3 lg:space-y-4">
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-8">Nenhuma atividade recente encontrada.</p>
            ) : (
              activities.slice(0, 10).map((act) => (
                <div key={act.id} className="flex items-start gap-3 group">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:bg-primary/10 transition-colors">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground font-medium leading-tight">
                      {act.action === 'stage_updated' && act.metadata?.lead_name 
                        ? `${act.metadata.lead_name} movido para ${act.metadata.stage_name}`
                        : act.action === 'ai_generation' && act.metadata?.lead_name
                        ? `Mensagens geradas: ${act.metadata.lead_name}`
                        : act.action === 'lead_created' && act.metadata?.lead_name
                        ? `Novo lead: ${act.metadata.lead_name}`
                        : act.action.replace('_', ' ')}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                      {formatDistanceToNow(new Date(act.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  </div>
);
}
