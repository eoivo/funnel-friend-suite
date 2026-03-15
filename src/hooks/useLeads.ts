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
  stage_color?: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export function useLeads(workspaceId?: string) {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ["leads", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("leads")
        .select("*, funnel_stages(id, name, color), profiles(full_name, email)")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map(l => ({
        ...l,
        stage_name: l.funnel_stages?.name || "Base",
        stage_color: l.funnel_stages?.color
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
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["activities", workspaceId] });
      toast.success("Lead criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao criar lead");
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, stageId }: { leadId: string; stageId: string }) => {
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .update({ stage_id: stageId })
        .eq("id", leadId)
        .select("*, funnel_stages(name), profiles(full_name, email)")
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
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", workspaceId] });
      toast.success("Etapa do lead atualizada!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao atualizar etapa");
    }
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ leadId, userId }: { leadId: string; userId: string | null }) => {
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .update({ assigned_to: userId })
        .eq("id", leadId)
        .select("*, profiles(full_name, email)")
        .single();

      if (leadError) throw leadError;

      // Log activity
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("activity_logs").insert({
          workspace_id: workspaceId,
          lead_id: leadId,
          user_id: userData.user.id,
          action: "assignment_updated",
          metadata: { 
            lead_name: lead.name, 
            assigned_to_name: lead.profiles?.full_name || lead.profiles?.email || "Ninguém"
          }
        });
      }
    },
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", workspaceId] });
      toast.success("Responsável atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao atualizar responsável");
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      // Get lead info before deletion for logging
      const { data: lead } = await supabase
        .from("leads")
        .select("name")
        .eq("id", leadId)
        .single();

      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);

      if (error) throw error;

      // Log activity
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && lead) {
        await supabase.from("activity_logs").insert({
          workspace_id: workspaceId,
          user_id: userData.user.id,
          action: "lead_deleted",
          metadata: { lead_name: lead.name }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["activities", workspaceId] });
      toast.success("Lead excluído com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao excluir lead");
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: Partial<Lead> }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select(`
          *,
          funnel_stages(id, name),
          profiles(full_name, email)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      toast.success("Lead atualizado com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao atualizar lead");
    }
  });

  return {
    leads,
    isLoading,
    error,
    createLead: createLeadMutation.mutateAsync,
    updateLead: updateLeadMutation.mutateAsync,
    updateStage: updateStageMutation.mutateAsync,
    updateAssignment: updateAssignmentMutation.mutateAsync,
    deleteLead: deleteLeadMutation.mutateAsync,
  };
}


export function useFunnelStages(workspaceId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
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

  const updateStage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; color?: string; position?: number } }) => {
      const { data, error } = await supabase
        .from("funnel_stages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funnel_stages", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      toast.success("Etapa atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Falha ao atualizar etapa");
    }
  });

  return { ...query, updateStage: updateStage.mutateAsync };
}
