import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const WORKSPACE_STORAGE_KEY = "sdr_flow_active_workspace";

interface Workspace {
  id: string;
  name: string;
  role: string;
  member_id: string;
  status: 'active' | 'pending';
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  pendingInvites: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  switchWorkspace: (id: string) => void;
  acceptInvite: (memberId: string) => Promise<void>;
  rejectInvite: (memberId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    localStorage.getItem(WORKSPACE_STORAGE_KEY)
  );

  const { data: allMemberships = [], isLoading } = useQuery({
    queryKey: ["workspaces", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*, workspaces(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      
      return data.map(m => ({
        ...m.workspaces,
        role: m.role,
        member_id: m.id,
        status: m.status
      }));
    },
    enabled: !!user
  });

  const workspaces = allMemberships.filter(m => m.status === 'active');
  const pendingInvites = allMemberships.filter(m => m.status === 'pending');

  // Keep activeWorkspaceId in sync with valid active workspaces
  useEffect(() => {
    if (workspaces.length > 0) {
      const isValid = workspaces.some(w => w.id === activeWorkspaceId);
      if (!activeWorkspaceId || !isValid) {
        const firstId = workspaces[0].id;
        setActiveWorkspaceId(firstId);
        localStorage.setItem(WORKSPACE_STORAGE_KEY, firstId);
      }
    }
  }, [workspaces, activeWorkspaceId]);

  const switchWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
    localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
    queryClient.invalidateQueries();
  }, [queryClient]);

  const acceptInvite = async (memberId: string) => {
    const { error } = await supabase
      .from('workspace_members')
      .update({ status: 'active' })
      .eq('id', memberId);
    
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["workspaces", user?.id] });
  };

  const rejectInvite = async (memberId: string) => {
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId);
    
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["workspaces", user?.id] });
  };

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || null;

  return (
    <WorkspaceContext.Provider value={{ 
      workspaces, 
      pendingInvites, 
      currentWorkspace, 
      isLoading, 
      switchWorkspace,
      acceptInvite,
      rejectInvite
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
}
