import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useWorkspaces() {
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*, workspace_members!inner(*)")
        .eq("workspace_members.user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return data;
    }
  });

  return {
    workspaces,
    isLoading,
    currentWorkspace: workspaces[0] || null,
  };
}

export function useWorkspaceMembers(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace_members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*, profiles(*)")
        .eq("workspace_id", workspaceId);

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}
