import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Copy, Send, Sparkles, Mail, Phone, Building2, User, Globe, Clock, Loader2, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useLeadDetail } from "@/hooks/useCampaigns"; // I added it there earlier
import { useLeads, useFunnelStages } from "@/hooks/useLeads";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/useWorkspaces";
import { useCampaigns } from "@/hooks/useCampaigns";
import { generateSDRMessages } from "@/lib/aiService";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const { data: lead, isLoading: isLoadingLead } = useLeadDetail(id);
  const { updateStage, updateAssignment } = useLeads(currentWorkspace?.id);
  const { data: stages = [] } = useFunnelStages(currentWorkspace?.id);
  const { data: campaigns = [] } = useCampaigns(currentWorkspace?.id);
  const { data: members = [] } = useWorkspaceMembers(currentWorkspace?.id);

  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageToSend, setMessageToSend] = useState<string | null>(null);

  if (isLoadingLead) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Lead not found.</p>
        <Button variant="ghost" onClick={() => navigate("/leads")} className="mt-2">Back to Leads</Button>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!selectedCampaignId) {
      toast.error("Select a campaign first");
      return;
    }
    
    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    if (!campaign) return;

    setIsGenerating(true);
    try {
      const { messages } = await generateSDRMessages(lead, campaign);
      setGeneratedMessages(messages);
      toast.success("Messages generated with Gemini 2.0!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate messages");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (msg: string) => {
    navigator.clipboard.writeText(msg);
    toast.success("Copied to clipboard");
  };

  const handleSend = (msg: string) => {
    setMessageToSend(msg);
  };

  const handleConfirmSend = async () => {
    if (!messageToSend) return;
    
    try {
      // Find "Tentando Contato" stage ID
      const targetStage = stages.find(s => s.name === "Tentando Contato");
      if (targetStage) {
        await updateStage({ leadId: lead.id, stageId: targetStage.id });
      }
      
      toast.success(`Message sent! Lead moved to "Tentando Contato"`);
      setGeneratedMessages([]);
      setMessageToSend(null);
    } catch (error: any) {
      toast.error("Failed to update lead stage after sending");
    }
  };

  const handleStageChange = async (stageId: string) => {
    try {
      await updateStage({ leadId: lead.id, stageId });
    } catch (error: any) {
       // Error handled by hook
    }
  };

  const initials = lead.name.split(" ").map((n) => n[0]).join("").toUpperCase();

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
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-lg font-medium text-foreground">{lead.name}</h1>
                    <p className="text-sm text-muted-foreground">{lead.role} at {lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1.5 items-end">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Funnel Stage</Label>
                    <Select value={lead.stage_id} onValueChange={handleStageChange}>
                      <SelectTrigger className="w-48 bg-muted border-border h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 items-end">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Responsible</Label>
                    <Select value={lead.assigned_to || "_unassigned"} onValueChange={(v) => updateAssignment({ leadId: lead.id, userId: v === "_unassigned" ? null : v })}>
                      <SelectTrigger className="w-48 bg-muted border-border h-9">
                        <SelectValue placeholder="Assign user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_unassigned">Unassigned</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.user_id} value={m.user_id}>
                            {m.profiles?.full_name || m.profiles?.email || 'User'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Details */}
            <Card className="p-5 bg-card border-border shadow-sdr-sm">
              <h2 className="text-sm font-medium text-foreground mb-3">Contact Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={Mail} label="Email" value={lead.email || "—"} />
                <InfoRow icon={Phone} label="Phone" value={lead.phone || "—"} />
                <InfoRow icon={Building2} label="Company" value={lead.company || "—"} />
                <InfoRow icon={User} label="Role" value={lead.role || "—"} />
                <InfoRow icon={Globe} label="Origin" value={lead.origin || "—"} />
                <InfoRow icon={Clock} label="Created" value={formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })} />
              </div>
            </Card>

            {/* Custom Fields */}
            <Card className="p-5 bg-card border-border shadow-sdr-sm">
              <h2 className="text-sm font-medium text-foreground mb-3">Custom Fields</h2>
              <div className="grid grid-cols-2 gap-4">
                {lead.custom_data && Object.keys(lead.custom_data).length > 0 ? (
                  Object.entries(lead.custom_data).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-sm text-foreground">{String(value) || "—"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic col-span-2">No custom data available.</p>
                )}
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-5 bg-card border-border shadow-sdr-sm">
              <h2 className="text-sm font-medium text-foreground mb-3">Notes</h2>
              <p className="text-sm text-muted-foreground">{lead.notes || "No notes yet."}</p>
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
                  <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                    <SelectTrigger className="bg-muted border-border text-sm">
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.length > 0 ? (
                        campaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="_no_campaign" disabled>No active campaigns</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || campaigns.length === 0}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Messages"}
                </Button>

                {generatedMessages.length > 0 && (
                  <>
                    <div className="space-y-3 mt-4">
                      {generatedMessages.map((msg, i) => (
                        <Card key={i} className="p-3 bg-muted border-border text-sm leading-relaxed text-foreground animate-slide-up">
                          <p>{msg}</p>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => handleCopy(msg)}>
                              <Copy className="h-3 w-3" /> Copy
                            </Button>
                            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => handleSend(msg)}>
                              <Send className="h-3 w-3" /> Send
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleGenerate} 
                      disabled={isGenerating} 
                      className="w-full mt-4 gap-2 border-border"
                    >
                      <RefreshCcw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      Regenerate Options
                    </Button>
                  </>
                )}
                {campaigns.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center italic mt-2">
                    Tip: Create a campaign in the "Campaigns" tab first.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!messageToSend} onOpenChange={(o) => !o && setMessageToSend(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this message to {lead?.name}? The lead will automatically be moved to "Tentando Contato".
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 px-4 bg-muted border border-border rounded-md text-sm mt-2 text-foreground">
             {messageToSend}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setMessageToSend(null)}>Cancel</Button>
            <Button onClick={handleConfirmSend} className="gap-2">
              <Send className="h-4 w-4" /> Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
