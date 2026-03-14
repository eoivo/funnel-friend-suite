import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useCustomFields(workspaceId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["custom_fields", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("workspace_id", workspaceId);
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });

  const addField = useMutation({
    mutationFn: async (newField: any) => {
      const { data, error } = await supabase
        .from("custom_fields")
        .insert([newField])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom_fields", workspaceId] });
      toast.success("Field added");
    }
  });

  const removeField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custom_fields")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom_fields", workspaceId] });
      toast.success("Field removed");
    }
  });

  return { ...query, addField, removeField };
}

export function useRequiredFields(workspaceId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["required_fields", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("stage_required_fields")
        .select("*")
        .eq("workspace_id", workspaceId);
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });

  const toggleRequired = useMutation({
    mutationFn: async ({ stageId, fieldName, isRequired }: { stageId: string, fieldName: string, isRequired: boolean }) => {
      if (isRequired) {
        const { error } = await supabase
          .from("stage_required_fields")
          .insert([{ workspace_id: workspaceId, stage_id: stageId, field_name: fieldName }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("stage_required_fields")
          .delete()
          .eq("stage_id", stageId)
          .eq("field_name", fieldName);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["required_fields", workspaceId] });
    }
  });

  return { ...query, toggleRequired };
}
