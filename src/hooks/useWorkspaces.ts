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
    currentWorkspace: workspaces[0] || null, // For MVP, we take the first one
  };
}
