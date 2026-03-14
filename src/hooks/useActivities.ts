import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useActivities(workspaceId?: string) {
  return useQuery({
    queryKey: ["activities", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}
