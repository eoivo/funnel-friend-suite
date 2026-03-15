import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

export function useWorkspaces() {
  const { 
    workspaces, 
    pendingInvites, 
    currentWorkspace, 
    isLoading, 
    switchWorkspace,
    acceptInvite,
    rejectInvite
  } = useWorkspaceContext();

  return {
    workspaces,
    pendingInvites,
    isLoading,
    currentWorkspace,
    switchWorkspace,
    acceptInvite,
    rejectInvite
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
