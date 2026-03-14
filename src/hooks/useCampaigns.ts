import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Lead } from "./useLeads";

export function useLeadDetail(leadId?: string) {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("*, funnel_stages(id, name)")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        stage_name: data.funnel_stages?.name
      } as Lead;
    },
    enabled: !!leadId,
  });
}

export function useCampaigns(workspaceId?: string) {
  return useQuery({
    queryKey: ["campaigns", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, funnel_stages(name)")
        .eq("workspace_id", workspaceId);

      if (error) throw error;
      return data.map(c => ({
        ...c,
        trigger_stage_name: c.funnel_stages?.name
      }));
    },
    enabled: !!workspaceId,
  });
}

export function useCampaignMutation(workspaceId?: string) {
  const queryClient = useQueryClient();

  const createCampaign = useMutation({
    mutationFn: async (newCampaign: any) => {
      const { data, error } = await supabase
        .from("campaigns")
        .insert([newCampaign])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
      toast.success("Campaign created");
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
      toast.success("Campaign updated");
    },
  });

  return { createCampaign, updateCampaign };
}
