import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { mockUsers } from "@/mock/mockUsers";
import { mockActivities } from "@/mock/mockActivities";
import { STAGES, LeadStage } from "@/mock/mockLeads";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Send, Sparkles, Mail, Phone, Building2, User, Globe, Clock } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const mockMessages = [
  "Hi {{name}}, I noticed {{company}} is scaling rapidly in the {{segment}} space. Our SDR teams are seeing 3x reply rates with AI-powered outreach. Would you have 15 minutes this week for a quick chat?",
  "Hey {{name}}, congrats on {{company}}'s growth! I work with {{segment}} companies to help their sales teams book more meetings with less effort. Interested in seeing how? Happy to share a quick case study.",
  "{{name}}, quick question — how is your SDR team handling personalization at scale? We've helped companies like {{company}} cut research time by 80%. Worth a 15-min conversation?",
];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { leads, updateLeadStage, campaigns } = useData();
  const lead = leads.find((l) => l.id === id);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!lead) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Lead not found.</p>
        <Button variant="ghost" onClick={() => navigate("/leads")} className="mt-2">Back to Leads</Button>
      </div>
    );
  }

  const user = mockUsers.find((u) => u.id === lead.responsibleId);
  const leadActivities = mockActivities.filter((a) => a.leadId === lead.id);

  const handleGenerate = () => {
    if (!selectedCampaign) {
      toast.error("Select a campaign first");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const messages = mockMessages.map((m) =>
        m.replace(/\{\{name\}\}/g, lead.name.split(" ")[0])
          .replace(/\{\{company\}\}/g, lead.company)
          .replace(/\{\{segment\}\}/g, lead.customFields.segment || "tech")
      );
      setGeneratedMessages(messages);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = (msg: string) => {
    navigator.clipboard.writeText(msg);
    toast.success("Copied to clipboard");
  };

  const handleSend = (msg: string) => {
    updateLeadStage(lead.id, "Tentando Contato");
    toast.success(`Message sent! Lead moved to "Tentando Contato"`);
    setGeneratedMessages([]);
  };

  const handleStageChange = (stage: LeadStage) => {
    if (stage === "Qualificado" && !lead.customFields.annualRevenue) {
      toast.error("Annual Revenue is required before qualifying a lead");
      return;
    }
    updateLeadStage(lead.id, stage);
    toast.success(`Stage updated to "${stage}"`);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-7xl mx-auto animate-slide-up">
        {/* Back */}
        <Button variant="ghost" onClick={() => navigate("/leads")} className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Lead Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header Card */}
            <Card className="p-5 bg-card border-border shadow-sdr-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {lead.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-lg font-medium text-foreground">{lead.name}</h1>
                    <p className="text-sm text-muted-foreground">{lead.role} at {lead.company}</p>
                  </div>
                </div>
                <Select value={lead.stage} onValueChange={(v) => handleStageChange(v as LeadStage)}>
                  <SelectTrigger className="w-48 bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Details */}
            <Card className="p-5 bg-card border-border shadow-sdr-sm">
              <h2 className="text-sm font-medium text-foreground mb-3">Contact Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={Mail} label="Email" value={lead.email} />
                <InfoRow icon={Phone} label="Phone" value={lead.phone} />
                <InfoRow icon={Building2} label="Company" value={lead.company} />
                <InfoRow icon={User} label="Role" value={lead.role} />
                <InfoRow icon={Globe} label="Origin" value={lead.origin} />
                <InfoRow icon={Clock} label="Created" value={formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })} />
              </div>
            </Card>

            {/* Custom Fields */}
            <Card className="p-5 bg-card border-border shadow-sdr-sm">
              <h2 className="text-sm font-medium text-foreground mb-3">Custom Fields</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(lead.customFields).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="text-sm text-foreground">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-5 bg-card border-border shadow-sdr-sm">
              <h2 className="text-sm font-medium text-foreground mb-3">Notes</h2>
              <p className="text-sm text-muted-foreground">{lead.notes || "No notes yet."}</p>
            </Card>

            {/* Assigned */}
            {user && (
              <Card className="p-4 bg-card border-border shadow-sdr-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned to</p>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card className="p-5 bg-card border-border shadow-sdr-sm">
              <h2 className="text-sm font-medium text-foreground mb-3">Activity History</h2>
              {leadActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {leadActivities.map((act) => {
                    const actUser = mockUsers.find((u) => u.id === act.userId);
                    return (
                      <div key={act.id} className="flex items-start gap-3 relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-border">
                        <div className="absolute left-[-3px] top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        <div>
                          <p className="text-xs text-foreground">{act.description}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {actUser?.name} · {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right: AI Generator */}
          <div className="space-y-4">
            <Card className="p-5 bg-card border-border shadow-sdr-sm sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Outreach Generator
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Campaign</Label>
                  <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                    <SelectTrigger className="bg-muted border-border text-sm">
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {isGenerating ? "Generating..." : "Generate Messages"}
                </Button>

                {generatedMessages.length > 0 && (
                  <div className="space-y-3 mt-2">
                    {generatedMessages.map((msg, i) => (
                      <Card key={i} className="p-3 bg-muted border-border text-sm leading-relaxed text-foreground animate-slide-up">
                        <p>{msg}</p>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => handleCopy(msg)}>
                            <Copy className="h-3 w-3" /> Copy
                          </Button>
                          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => handleSend(msg)}>
                            <Send className="h-3 w-3" /> Send & Move
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
