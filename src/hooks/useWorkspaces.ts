import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useWorkspaces() {
  const { user } = useAuth();

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["workspaces", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*, workspaces(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Map to return workspace objects with the membership info
      return data.map(m => ({
        ...m.workspaces,
        role: m.role,
        member_id: m.id
      }));
    },
    enabled: !!user
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
