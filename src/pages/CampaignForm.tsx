import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { STAGES, LeadStage } from "@/mock/mockLeads";
import { Campaign } from "@/mock/mockCampaigns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CampaignFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, setCampaigns } = useData();
  const existing = id ? campaigns.find((c) => c.id === id) : null;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name || "",
    context: existing?.context || "",
    prompt: existing?.prompt || "",
    triggerStage: (existing?.triggerStage || "Lead Mapeado") as LeadStage,
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    if (isEdit && existing) {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === existing.id ? { ...c, ...form } : c))
      );
      toast.success("Campaign updated");
    } else {
      const newCampaign: Campaign = {
        id: `campaign-${Date.now()}`,
        ...form,
        status: "draft",
        createdAt: new Date().toISOString(),
        messagesGenerated: 0,
      };
      setCampaigns((prev) => [...prev, newCampaign]);
      toast.success("Campaign created");
    }
    navigate("/campaigns");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-slide-up">
      <Button variant="ghost" onClick={() => navigate("/campaigns")} className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Campaigns
      </Button>

      <Card className="p-6 bg-card border-border shadow-sdr-sm">
        <h1 className="text-lg font-medium text-foreground mb-6">
          {isEdit ? "Edit Campaign" : "New Campaign"}
        </h1>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Campaign Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted border-border" placeholder="e.g., Cold Outreach — SaaS Leaders" />
          </div>
          <div className="space-y-1.5">
            <Label>Context</Label>
            <Textarea value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} className="bg-muted border-border min-h-[100px]" placeholder="Describe the target audience and goals..." />
          </div>
          <div className="space-y-1.5">
            <Label>Generation Prompt</Label>
            <Textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} className="bg-muted border-border min-h-[120px]" placeholder="Write a prompt template. Use {{name}}, {{company}}, {{role}}..." />
          </div>
          <div className="space-y-1.5">
            <Label>Trigger Stage</Label>
            <Select value={form.triggerStage} onValueChange={(v) => setForm({ ...form, triggerStage: v as LeadStage })}>
              <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isEdit ? "Save Changes" : "Create Campaign"}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/campaigns")}>Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
