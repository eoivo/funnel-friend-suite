import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/useWorkspaces";
import { useLeads, useFunnelStages, Lead } from "@/hooks/useLeads";
import { useCampaigns } from "@/hooks/useCampaigns";
import { generateSDRMessages } from "@/lib/aiService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Loader2, Building2, Clock, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRequiredFields, useCustomFields } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

function KanbanColumn({ stageId, stageName, stageColor, leads, children }: { stageId: string; stageName: string; stageColor?: string; leads: Lead[]; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId, data: { stageId, stageName } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[280px] w-[280px] shrink-0 rounded-2xl transition-all duration-200 bg-muted/40 border border-border pb-4 relative overflow-hidden",
        isOver && "bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      {/* Stage Color Indicator Top */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-60" 
        style={{ backgroundColor: stageColor || "hsl(var(--primary))" }} 
      />

      <div className="flex items-center justify-between px-4 py-4 mb-2 sticky top-0 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div 
            className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" 
            style={{ backgroundColor: stageColor || "hsl(var(--primary))", color: stageColor || "hsl(var(--primary))" }} 
          />
          <h3 className="text-xs font-bold text-foreground/90 uppercase tracking-wider">{stageName}</h3>
          <span className="text-[10px] font-bold tabular-nums text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-2 min-h-[500px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}

function LeadCard({ lead, isDragging, onDelete, onEdit }: { lead: Lead; isDragging?: boolean; onDelete?: (e: React.MouseEvent, id: string) => void; onEdit?: (e: React.MouseEvent, lead: Lead) => void }) {
  const navigate = useNavigate();
  const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  
  const daysInStage = Math.max(0, Math.floor(
    (Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <Card 
      onClick={() => navigate(`/leads/${lead.id}`)}
      className={`p-4 glass-card cursor-pointer border-border/50 hover:border-primary/20 transition-all group relative ${
        isDragging ? "ring-2 ring-primary shadow-glow" : "hover:shadow-sdr-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 overflow-hidden">
          <p className="text-base font-bold text-primary truncate leading-tight group-hover:brightness-110 transition-all mb-1">
            {lead.name}
          </p>
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <p className="text-xs font-semibold truncate">
              {lead.company || "Sem Empresa"}
            </p>
          </div>
        </div>
        <Avatar className="h-9 w-9 shrink-0 ring-4 ring-primary/5">
          <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary uppercase">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground/50">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-tight tabular-nums">
              {daysInStage}d estagnado
            </span>
          </div>
          {lead.origin && (
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider px-2 py-0 h-4.5 border-primary/20 bg-primary/5 text-primary w-fit">
              {lead.origin}
            </Badge>
          )}
        </div>

        {!isDragging && (
          <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border transition-all backdrop-blur-sm">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onEdit(e, lead)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onDelete(e, lead.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function DraggableLeadCard({ lead, onDelete, onEdit }: { lead: Lead; onDelete: (e: React.MouseEvent, id: string) => void; onEdit: (e: React.MouseEvent, lead: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: lead.id, 
    data: { lead } 
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <LeadCard lead={lead} isDragging={isDragging} onDelete={onDelete} onEdit={onEdit} />
    </div>
  );
}

import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, LayoutList, Table as TableIcon } from "lucide-react";

type ViewMode = "kanban" | "table" | "list";

function LeadsTableView({ leads, onDelete, onEdit }: { leads: Lead[]; onDelete: (e: React.MouseEvent, id: string) => void; onEdit: (e: React.MouseEvent, lead: Lead) => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 bg-background/50">
      <div className="max-w-7xl mx-auto glass-card border-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lead / Empresa</th>
                <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Etapa</th>
                <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Origem</th>
                <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Responsável</th>
                <th className="p-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-black">
                          {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{lead.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{lead.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <Badge 
                      variant="outline" 
                      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 border-transparent"
                      style={{ 
                        backgroundColor: `${lead.stage_color || 'hsl(var(--primary))'}15`, 
                        color: lead.stage_color || 'hsl(var(--primary))',
                        border: `1px solid ${lead.stage_color || 'hsl(var(--primary))'}30`
                      }}
                    >
                      {lead.stage_name}
                    </Badge>
                  </td>
                  <td className="p-5">
                    <span className="text-xs text-muted-foreground font-medium">{lead.origin || "—"}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[8px] font-black">
                         {lead.profiles?.full_name?.[0] || lead.assigned_to?.[0] || 'U'}
                       </div>
                       <span className="text-xs text-foreground/80 font-medium truncate max-w-[120px]">
                         {lead.profiles?.full_name || "Sem responsável"}
                       </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-8 text-[10px] uppercase font-black tracking-widest hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                       >
                         Ver Perfil
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={(e) => onEdit(e, lead)}
                         className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg outline-none"
                       >
                         <Pencil className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={(e) => onDelete(e, lead.id)}
                         className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg outline-none"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeadsListView({ leads, onDelete, onEdit }: { leads: Lead[]; onDelete: (e: React.MouseEvent, id: string) => void; onEdit: (e: React.MouseEvent, lead: Lead) => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 bg-background/50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <Card 
            key={lead.id} 
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="p-5 glass-card border-border flex flex-col justify-between gap-5 cursor-pointer card-hover-effect rounded-2xl group relative"
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
            </div>
            
            <div className="flex items-start gap-4 relative z-10">
               <Avatar className="h-12 w-12 shrink-0 ring-4 ring-primary/5">
                <AvatarFallback className="bg-primary/20 text-primary font-black text-sm">
                   {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate mb-1">{lead.name}</p>
                <div className="flex items-center gap-2">
                   <Building2 className="h-3 w-3 text-muted-foreground" />
                   <span className="text-xs text-muted-foreground font-medium truncate uppercase tracking-tight">{lead.company || "Sem Empresa"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Etapa Atual</span>
                <Badge 
                  variant="outline" 
                  className="text-[10px] font-black uppercase tracking-widest border-transparent w-fit px-2"
                  style={{ 
                    backgroundColor: `${lead.stage_color || 'hsl(var(--primary))'}15`, 
                    color: lead.stage_color || 'hsl(var(--primary))',
                    border: `1px solid ${lead.stage_color || 'hsl(var(--primary))'}30`
                  }}
                >
                  {lead.stage_name}
                </Badge>
              </div>
              <div className="flex flex-row items-center gap-3">
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Origem</span>
                  <span className="text-xs text-foreground/80 font-bold uppercase tracking-tighter">{lead.origin || "Direto"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => onEdit(e, lead)}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => onDelete(e, lead.id)}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/PageHeader";

export default function LeadsPage() {
  const isMobile = useIsMobile();
  const { currentWorkspace } = useWorkspaces();
  const { user } = useAuth();
  const { leads, isLoading, createLead, updateStage, updateLead, deleteLead } = useLeads(currentWorkspace?.id);
  const { data: stages = [] } = useFunnelStages(currentWorkspace?.id);
  const { data: requiredFields = [] } = useRequiredFields(currentWorkspace?.id);
  const { data: campaigns = [] } = useCampaigns(currentWorkspace?.id);
  const { data: customFields = [] } = useCustomFields(currentWorkspace?.id);
  
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? "list" : "kanban");
  const [search, setSearch] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<{leadName: string, destination: string, fields: string[]} | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const { data: members = [] } = useWorkspaceMembers(currentWorkspace?.id);
  const navigate = useNavigate();

  const [newLead, setNewLead] = useState<any>({
    name: "", email: "", phone: "", company: "", role: "", origin: "LinkedIn", notes: "",
    custom_data: {}
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch = 
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company?.toLowerCase().includes(search.toLowerCase());
      
      const matchesAssigned = assignedFilter === "all" ? true : l.assigned_to === assignedFilter;
      
      return matchesSearch && matchesAssigned;
    });
  }, [leads, search, assignedFilter]);

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  
  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    
    if (!over) return;
    
    const activeLead = leads.find(l => l.id === active.id);
    if (!activeLead) return;
    
    let destinationStageId = over.data?.current?.stageId as string;
    let destinationStageName = over.data?.current?.stageName as string;

    if (!destinationStageId) {
      const overLead = leads.find(l => l.id === over.id);
      if (overLead) {
        destinationStageId = overLead.stage_id;
        destinationStageName = overLead.stage_name || "";
      }
    }
    
    if (!destinationStageId || destinationStageId === activeLead.stage_id) return;
    
    const requiredForDest = requiredFields.filter(r => r.stage_id === destinationStageId).map(r => r.field_name);
    const missing: string[] = [];
    
    requiredForDest.forEach(field => {
       const val = activeLead[field as keyof Lead] || activeLead.custom_data?.[field];
       if (!val || val === "") {
         missing.push(field);
       }
    });
    
    if (missing.length > 0) {
      setMissingFields({
        leadName: activeLead.name,
        destination: destinationStageName,
        fields: missing
      });
      return;
    }
    
    await updateStage({ leadId: activeLead.id, stageId: destinationStageId });

    const triggerCampaigns = campaigns.filter(c => c.trigger_stage_id === destinationStageId);
    if (triggerCampaigns.length > 0) {
      toast.info(`Automatizando as mensagens com IA para ${activeLead.name}...`);
      for (const campaign of triggerCampaigns) {
        generateSDRMessages(activeLead, campaign).catch(console.error);
      }
    }
  };

  const handleSaveLead = async () => {
    if (!currentWorkspace || !user) return;
    setIsCreating(true);
    try {
      if (editingLeadId) {
        await updateLead({ 
          leadId: editingLeadId, 
          updates: newLead 
        });
      } else {
        const baseStage = stages.find(s => s.position === 1);
        
        const createdLead = await createLead({
          workspace_id: currentWorkspace.id,
          stage_id: baseStage?.id,
          assigned_to: user.id,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          company: newLead.company,
          role: newLead.role,
          origin: newLead.origin,
          notes: newLead.notes,
          custom_data: newLead.custom_data || {},
        });
        
        if (baseStage?.id && createdLead) {
          const triggerCampaigns = campaigns.filter(c => c.trigger_stage_id === baseStage.id);
          if (triggerCampaigns.length > 0) {
            toast.info(`Automatizando as mensagens com IA para ${createdLead.name}...`);
            for (const campaign of triggerCampaigns) {
               generateSDRMessages(createdLead, campaign).catch(console.error);
            }
          }
        }
      }
      
      setNewLead({ name: "", email: "", phone: "", company: "", role: "", origin: "LinkedIn", notes: "", custom_data: {} });
      setEditingLeadId(null);
      setSheetOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead(leadToDelete);
      setLeadToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLeadToDelete(id);
  };

  const openEditSheet = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setEditingLeadId(lead.id);
    setNewLead({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      role: lead.role || "",
      origin: lead.origin || "LinkedIn",
      notes: lead.notes || "",
      custom_data: lead.custom_data || {},
    });
    setSheetOpen(true);
  };

  const activeLead = leads.find((l) => l.id === activeId);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-hidden">
      <PageHeader 
        title="Leads" 
        description="Gerencie seu funil de prospecção."
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* View Toggle - Only on Desktop */}
          {!isMobile && (
            <div className="flex items-center bg-muted/80 border border-border p-1 rounded-xl mr-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("kanban")}
                className={`h-8 w-8 p-0 rounded-lg ${viewMode === "kanban" ? "bg-primary text-black hover:bg-primary/95" : "text-muted-foreground"}`}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("table")}
                className={`h-8 w-8 p-0 rounded-lg ${viewMode === "table" ? "bg-primary text-black hover:bg-primary/95" : "text-muted-foreground"}`}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("list")}
                className={`h-8 w-8 p-0 rounded-lg ${viewMode === "list" ? "bg-primary text-black hover:bg-primary/95" : "text-muted-foreground"}`}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Buscar..."
              className="pl-10 w-full sm:w-[150px] lg:w-[200px] bg-muted/80 border border-border text-xs h-10 rounded-xl focus:ring-primary/20 transition-all font-medium text-foreground outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={assignedFilter} onValueChange={setAssignedFilter}>
            <SelectTrigger className="w-full sm:w-[140px] bg-muted/80 border-border text-xs h-10 rounded-xl font-bold">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {members.map(m => (
                <SelectItem key={m.user_id} value={m.user_id}>{m.profiles?.full_name || "Usuário"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet open={sheetOpen} onOpenChange={(o) => {
            setSheetOpen(o);
            if (!o) {
              setEditingLeadId(null);
              setNewLead({ name: "", email: "", phone: "", company: "", role: "", origin: "LinkedIn", notes: "", custom_data: {} });
            }
          }}>
            <SheetTrigger asChild>
              <Button className="gap-2 bg-primary text-black font-black hover:bg-primary/95 shadow-glow h-10 sm:px-4 rounded-xl transition-all text-xs">
                <Plus className="h-3.5 w-3.5" /> <span>Novo Lead</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border w-full sm:w-[540px]">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-foreground font-['Syne']">
                  {editingLeadId ? "Editar Lead" : "Novo Lead"}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-8">
                <div className="grid grid-cols-1 gap-4">
                  {(["name", "email", "company"] as const).map((field) => (
                    <div key={field} className="space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                        {field === "name" ? "Nome Completo" : 
                         field === "email" ? "E-mail" : "Empresa"}
                      </Label>
                      <Input
                        value={newLead[field]}
                        onChange={(e) => setNewLead({ ...newLead, [field]: e.target.value })}
                        className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20"
                        placeholder={`Digite o ${field === "name" ? "nome" : field === "email" ? "e-mail" : "nome da empresa"}...`}
                      />
                    </div>
                  ))}

                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Telefone</Label>
                    <Input
                      value={newLead.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        let formatted = val;
                        if (val.length > 0) {
                          formatted = "(" + val.substring(0, 2);
                          if (val.length > 2) {
                            formatted += ") " + val.substring(2, 7);
                            if (val.length > 7) {
                              formatted += "-" + val.substring(7, 11);
                            }
                          }
                        }
                        setNewLead({ ...newLead, phone: formatted.substring(0, 15) });
                      }}
                      className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Cargo</Label>
                    <Select value={newLead.role} onValueChange={(v) => setNewLead({ ...newLead, role: v })}>
                      <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                        <SelectValue placeholder="Selecione o cargo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {["Proprietário", "Sócio", "Diretor", "Gerente de Vendas", "Gerente de Marketing", "SDR", "BDR", "Vendedor", "Outro"].map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dinamic Custom Fields */}
                  {customFields.map((field: any) => (
                    <div key={field.id} className="space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                        {field.name}
                      </Label>
                      {field.field_type === "select" ? (
                        <Select 
                          value={newLead.custom_data?.[field.field_key] || ""} 
                          onValueChange={(v) => setNewLead({ 
                            ...newLead, 
                            custom_data: { ...newLead.custom_data, [field.field_key]: v } 
                          })}
                        >
                          <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                            <SelectValue placeholder={`Selecione ${field.name}...`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt: string) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.field_type === "number" ? "number" : "text"}
                          value={newLead.custom_data?.[field.field_key] || ""}
                          onChange={(e) => setNewLead({ 
                            ...newLead, 
                            custom_data: { ...newLead.custom_data, [field.field_key]: e.target.value } 
                          })}
                          className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20"
                          placeholder={`Digite ${field.name}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Origem</Label>
                  <Select value={newLead.origin} onValueChange={(v) => setNewLead({ ...newLead, origin: v })}>
                    <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["LinkedIn", "Inbound", "Indicação", "Cold Outreach", "Evento"].map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Notas</Label>
                  <Textarea 
                    value={newLead.notes} 
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} 
                    className="bg-muted/30 border-border rounded-xl min-h-[100px]" 
                    placeholder="Observações..."
                  />
                </div>
                <Button 
                  onClick={handleSaveLead} 
                  disabled={isCreating}
                  className="w-full bg-primary text-black font-black hover:bg-primary/90 h-12 rounded-xl mt-4 shadow-glow"
                >
                  {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingLeadId ? "Salvar Alterações" : "Criar Lead")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </PageHeader>

      {viewMode === "kanban" && !isMobile && (
        <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-background/50 scrollbar-hide snap-x snap-mandatory lg:snap-none">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 sm:gap-6 h-full min-h-[calc(100vh-250px)]">
              {stages.map((stage) => {
                const stageLeads = filteredLeads.filter((l) => l.stage_id === stage.id);
                return (
                  <div key={stage.id} className="snap-center lg:snap-align-none shrink-0 w-[85vw] sm:w-[320px] lg:w-[280px]">
                    <KanbanColumn stageId={stage.id} stageName={stage.name} stageColor={stage.color} leads={stageLeads}>
                      <div className="space-y-3">
                        {stageLeads.map((lead) => (
                          <DraggableLeadCard key={lead.id} lead={lead} onDelete={openDeleteModal} onEdit={openEditSheet} />
                        ))}
                      </div>
                    </KanbanColumn>
                  </div>
                );
              })}
            </div>
            <DragOverlay>
              {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {viewMode === "table" && <LeadsTableView leads={filteredLeads} onDelete={openDeleteModal} onEdit={openEditSheet} />}
      {(viewMode === "list" || (viewMode === "kanban" && isMobile)) && <LeadsListView leads={filteredLeads} onDelete={openDeleteModal} onEdit={openEditSheet} />}

      <Dialog open={!!missingFields} onOpenChange={(o) => !o && setMissingFields(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Campos Obrigatórios</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              O lead {missingFields?.leadName} precisa de informações adicionais para entrar na etapa "{missingFields?.destination}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Campos faltando:</h4>
            <ul className="grid grid-cols-2 gap-2">
              {missingFields?.fields.map(f => (
                <li key={f} className="capitalize text-sm text-destructive flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-destructive" />
                  {f === "email" ? "E-mail" : 
                   f === "phone" ? "Telefone" : 
                   f === "company" ? "Empresa" : 
                   f === "role" ? "Cargo" : f}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setMissingFields(null)}>Fechar</Button>
            <Button className="bg-primary text-black font-bold hover:bg-primary/95 shadow-glow" onClick={() => {
              const id = activeLead?.id;
              setMissingFields(null);
              if (id) navigate(`/leads/${id}`);
            }}>Editar Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!leadToDelete} onOpenChange={(o) => !o && setLeadToDelete(null)}>
        <DialogContent className="bg-card border-border max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" /> Excluir Lead
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              Você tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="ghost" className="text-muted-foreground font-bold" onClick={() => setLeadToDelete(null)}>
              Cancelar
            </Button>
            <Button className="bg-destructive text-white font-bold hover:bg-destructive/90" onClick={handleDeleteConfirm}>
              Sim, Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
