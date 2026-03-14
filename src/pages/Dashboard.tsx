import { useData } from "@/contexts/DataContext";
import { STAGES } from "@/mock/mockLeads";
import { mockActivities } from "@/mock/mockActivities";
import { mockUsers } from "@/mock/mockUsers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Send, Users, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { leads } = useData();
  const navigate = useNavigate();

  const totalLeads = leads.length;
  const stageCountMap = STAGES.map((stage) => ({
    stage,
    count: leads.filter((l) => l.stage === stage).length,
  }));
  const maxCount = Math.max(...stageCountMap.map((s) => s.count), 1);

  const recentActivities = mockActivities.slice(0, 6);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Convert more leads, faster.</p>
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
              <p className="text-2xl font-semibold tabular-nums text-foreground">{totalLeads}</p>
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
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {leads.filter((l) => l.stage === "Qualificado" || l.stage === "Reunião Agendada").length}
              </p>
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
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {leads.filter((l) => l.stage === "Tentando Contato").length}
              </p>
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
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {leads.filter((l) => l.stage === "Reunião Agendada").length}
              </p>
              <p className="text-xs text-muted-foreground">Meetings Set</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Funnel + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel Bar Chart */}
        <Card className="col-span-2 p-5 bg-card border-border shadow-sdr-sm">
          <h2 className="text-sm font-medium text-foreground mb-4">Funnel Overview</h2>
          <div className="space-y-3">
            {stageCountMap.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-32 truncate">{stage}</span>
                <div className="flex-1 h-6 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-primary/80 rounded-sm transition-all duration-300"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums text-foreground w-6 text-right">{count}</span>
              </div>
            ))}
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
            {recentActivities.map((act) => {
              const user = mockUsers.find((u) => u.id === act.userId);
              return (
                <div key={act.id} className="flex items-start gap-2">
                  <Avatar className="h-6 w-6 mt-0.5">
                    <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">{user?.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{act.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
