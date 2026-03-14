import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Lead {
  id: string;
  workspace_id: string;
  stage_id: string;
  assigned_to: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  origin: string | null;
  notes: string | null;
  custom_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  stage_name?: string;
}

export function useLeads(workspaceId?: string) {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ["leads", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("leads")
        .select("*, funnel_stages(id, name)")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map(l => ({
        ...l,
        stage_name: l.funnel_stages?.name || "Base"
      })) as Lead[];
    },
    enabled: !!workspaceId,
  });

  const createLeadMutation = useMutation({
    mutationFn: async (newLead: Partial<Lead>) => {
      const { data: lead, error } = await supabase
        .from("leads")
        .insert([newLead])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("activity_logs").insert({
          workspace_id: workspaceId,
          lead_id: lead.id,
          user_id: userData.user.id,
          action: "lead_created",
          metadata: { lead_name: lead.name }
        });
      }

      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Lead created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create lead");
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, stageId }: { leadId: string; stageId: string }) => {
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .update({ stage_id: stageId })
        .eq("id", leadId)
        .select("*, funnel_stages(name)")
        .single();

      if (leadError) throw leadError;

      // Log activity
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("activity_logs").insert({
          workspace_id: workspaceId,
          lead_id: leadId,
          user_id: userData.user.id,
          action: "stage_updated",
          metadata: { 
            lead_name: lead.name, 
            stage_name: lead.funnel_stages?.name 
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Lead stage updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stage");
    }
  });

  return {
    leads,
    isLoading,
    error,
    createLead: createLeadMutation.mutateAsync,
    updateStage: updateStageMutation.mutateAsync,
  };
}

export function useFunnelStages(workspaceId?: string) {
  return useQuery({
    queryKey: ["funnel_stages", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("funnel_stages")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}
