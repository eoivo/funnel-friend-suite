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
import { useMemo } from "react";

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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Convert more leads, faster from {currentWorkspace?.name || 'your workspace'}.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/campaigns/new")} className="gap-2">
            <Send className="h-3.5 w-3.5" /> New Campaign
          </Button>
          <Button onClick={() => navigate("/leads")} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border shadow-sdr-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border shadow-sdr-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{stats.qualifiedCount}</p>
              <p className="text-xs text-muted-foreground">Qualified+</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border shadow-sdr-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
              <Send className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{stats.outreachCount}</p>
              <p className="text-xs text-muted-foreground">In Outreach</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border shadow-sdr-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{stats.meetingsCount}</p>
              <p className="text-xs text-muted-foreground">Meetings Set</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Funnel + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel Bar Chart */}
        <Card className="col-span-2 p-5 bg-card border-border shadow-sdr-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Funnel Overview</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] text-muted-foreground">Volume</span>
              </div>
              <div className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                Total Conv: {stats.total > 0 ? ((stats.meetingsCount / stats.total) * 100).toFixed(1) : 0}%
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
                      <div className="text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
                        ↓ {conversion}% conv.
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 truncate">{stage.name}</span>
                    <div className="flex-1 h-7 bg-muted/50 rounded-md overflow-hidden relative border border-border/20">
                      <div
                        className="h-full bg-primary/70 rounded-sm transition-all duration-500 ease-out"
                        style={{ width: `${(stage.count / stats.max) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      {stage.count > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-foreground/80">
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
        <Card className="p-5 bg-card border-border shadow-sdr-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/leads")}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-8">No recent activity found.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                    <Activity className="h-3 w-3 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground font-medium">
                      {act.action === 'stage_updated' && act.metadata?.lead_name 
                        ? `${act.metadata.lead_name} moved to ${act.metadata.stage_name}`
                        : act.action === 'ai_generation' && act.metadata?.lead_name
                        ? `AI generated messages for ${act.metadata.lead_name}`
                        : act.action === 'lead_created' && act.metadata?.lead_name
                        ? `New lead: ${act.metadata.lead_name}`
                        : act.action.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
