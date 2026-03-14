import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const { data: campaigns = [], isLoading } = useCampaigns(currentWorkspace?.id);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">AI-powered outreach sequences</p>
        </div>
        <Button onClick={() => navigate("/campaigns/new")} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New Campaign
        </Button>
      </div>

      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Send className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground italic">No campaigns created yet. Create one to start using AI message generation.</p>
            <Button variant="outline" onClick={() => navigate("/campaigns/new")}>
              Create your first campaign
            </Button>
          </Card>
        ) : (
          campaigns.map((c) => (
            <Card
              key={c.id}
              onClick={() => navigate(`/campaigns/${c.id}`)}
              className="p-4 bg-card border-border shadow-sdr-sm cursor-pointer hover:shadow-sdr-md transition-shadow duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Send className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Trigger: {c.trigger_stage_name || 'Manual'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={c.is_active ? "default" : "secondary"}
                    className={c.is_active ? "bg-primary/20 text-primary border-primary/30" : ""}
                  >
                    {c.is_active ? 'Active' : 'Draft'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
