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
        .select(`
          *,
          funnel_stages(id, name),
          assigned_to_profile:assigned_to(id, full_name, email)
        `)
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
      toast.success("Campanha criada com sucesso!");
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
      toast.success("Campanha atualizada com sucesso!");
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      // Check if campaign has leads (messages)
      const { count, error: checkError } = await supabase
        .from("generated_messages")
        .select("*", { count: 'exact', head: true })
        .eq("campaign_id", id);

      if (checkError) throw checkError;
      
      if (count && count > 0) {
        throw new Error(`Esta campanha possui ${count} lead(s) associados. Remova os leads ou as mensagens geradas antes de excluir a campanha.`);
      }

      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
      toast.success("Campanha excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao excluir campanha");
    }
  });

  return { createCampaign, updateCampaign, deleteCampaign };
}

export function useGeneratedMessages(leadId?: string) {
  return useQuery({
    queryKey: ["generated_messages", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const { data, error } = await supabase
        .from("generated_messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });
}

export function useMarkAsSent(leadId?: string, workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, campaignId, index }: { messageId: string; campaignId: string; index: number }) => {
      const { data, error } = await supabase
        .from("generated_messages")
        .update({
          was_sent: true,
          sent_at: new Date().toISOString(),
          sent_message_index: index
        })
        .eq("id", messageId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("activity_logs").insert({
          workspace_id: workspaceId,
          lead_id: leadId,
          user_id: userData.user.id,
          action: "message_sent",
          metadata: { 
            campaign_id: campaignId,
            message_index: index
          }
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated_messages", leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", workspaceId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao registrar envio");
    }
  });
}
