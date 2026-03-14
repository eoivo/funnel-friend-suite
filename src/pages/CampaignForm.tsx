import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useFunnelStages } from "@/hooks/useLeads";
import { useCampaigns, useCampaignMutation } from "@/hooks/useCampaigns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CampaignFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const { data: campaigns = [], isLoading: isLoadingCaps } = useCampaigns(currentWorkspace?.id);
  const { data: stages = [] } = useFunnelStages(currentWorkspace?.id);
  const { createCampaign, updateCampaign } = useCampaignMutation(currentWorkspace?.id);

  const existing = id ? campaigns.find((c) => c.id === id) : null;
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    context: "",
    generation_prompt: "",
    trigger_stage_id: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "",
        context: existing.context || "",
        generation_prompt: existing.generation_prompt || "",
        trigger_stage_id: existing.trigger_stage_id || "",
      });
    }
  }, [existing]);

  const handleSave = async () => {
    if (!currentWorkspace) return;
    if (!form.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        context: form.context,
        generation_prompt: form.generation_prompt,
        trigger_stage_id: form.trigger_stage_id || null, // Ensure null if empty
      };

      if (isEdit && id) {
        await updateCampaign.mutateAsync({ 
          id, 
          updates: payload 
        });
      } else {
        await createCampaign.mutateAsync({
          workspace_id: currentWorkspace.id,
          ...payload,
          is_active: true
        });
      }
      navigate("/campaigns");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save campaign");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoadingCaps) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto animate-slide-up max-w-2xl">
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
            <Input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="bg-muted border-border" 
              placeholder="e.g., Cold Outreach — SaaS Leaders" 
            />
          </div>
          <div className="space-y-1.5">
            <Label>Context / Description</Label>
            <Textarea 
              value={form.context} 
              onChange={(e) => setForm({ ...form, context: e.target.value })} 
              className="bg-muted border-border min-h-[100px]" 
              placeholder="Describe the target audience and goals..." 
            />
          </div>
          <div className="space-y-1.5">
            <Label>Generation Prompt Template</Label>
            <Textarea 
              value={form.generation_prompt} 
              onChange={(e) => setForm({ ...form, generation_prompt: e.target.value })} 
              className="bg-muted border-border min-h-[120px]" 
              placeholder="Write a prompt template. Use {{name}}, {{company}}, {{role}} as placeholders." 
            />
            <p className="text-[10px] text-muted-foreground italic">Tip: The AI works best when you define the tone (e.g., 'professional but friendly').</p>
          </div>
          <div className="space-y-1.5">
            <Label>Trigger Stage (Optional)</Label>
            <Select value={form.trigger_stage_id} onValueChange={(v) => setForm({ ...form, trigger_stage_id: v })}>
              <SelectTrigger className="bg-muted border-border text-sm">
                <SelectValue placeholder="Select a stage..." />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? "Save Changes" : "Create Campaign")}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/campaigns")}>Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
