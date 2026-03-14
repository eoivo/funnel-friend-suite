import { useData } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function CampaignsPage() {
  const { campaigns } = useData();
  const navigate = useNavigate();

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
        {campaigns.map((c) => (
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
                    Trigger: {c.triggerStage} · {c.messagesGenerated} messages generated
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={c.status === "active" ? "default" : "secondary"}
                  className={c.status === "active" ? "bg-primary/20 text-primary border-primary/30" : ""}
                >
                  {c.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
