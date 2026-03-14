import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useLeads, useFunnelStages, Lead } from "@/hooks/useLeads";
import { useCampaigns } from "@/hooks/useCampaigns";
import { generateSDRMessages } from "@/lib/aiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Loader2 } from "lucide-react";
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
import { useRequiredFields } from "@/hooks/useSettings";

function KanbanColumn({ stageId, stageName, leads, children }: { stageId: string; stageName: string; leads: Lead[]; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId, data: { stageId, stageName } });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] w-[260px] shrink-0 rounded-lg transition-colors duration-150 ${
        isOver ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-foreground">{stageName}</h3>
          <span className="text-[11px] tabular-nums text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {leads.length}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-1 pb-2 min-h-[100px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}

function LeadCard({ lead, isDragging }: { lead: Lead; isDragging?: boolean }) {
  const navigate = useNavigate();
  const initials = lead.name.slice(0, 2).toUpperCase();
  
  const daysInStage = Math.max(0, Math.floor(
    (Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <div
      onClick={() => !isDragging && navigate(`/leads/${lead.id}`)}
      className={`group p-3 rounded-lg bg-card border border-border cursor-pointer transition-all duration-150 hover:shadow-sdr-md hover:bg-secondary/30 ${
        isDragging ? "shadow-sdr-md opacity-80 rotate-1" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
          <p className="text-xs text-muted-foreground truncate">{lead.company || "No Company"}</p>
        </div>
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-muted-foreground tabular-nums">{daysInStage}d since update</span>
        {lead.origin && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {lead.origin}
          </Badge>
        )}
      </div>
    </div>
  );
}

function DraggableLeadCard({ lead }: { lead: Lead }) {
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
      <LeadCard lead={lead} isDragging={isDragging} />
    </div>
  );
}

export default function LeadsPage() {
  const { currentWorkspace } = useWorkspaces();
  const { user } = useAuth();
  const { leads, isLoading, createLead, updateStage } = useLeads(currentWorkspace?.id);
  const { data: stages = [] } = useFunnelStages(currentWorkspace?.id);
  const { data: requiredFields = [] } = useRequiredFields(currentWorkspace?.id);
  const { data: campaigns = [] } = useCampaigns(currentWorkspace?.id);
  
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [missingFields, setMissingFields] = useState<{leadName: string, destination: string, fields: string[]} | null>(null);
  const navigate = useNavigate();

  const [newLead, setNewLead] = useState({
    name: "", email: "", phone: "", company: "", role: "", origin: "LinkedIn", notes: "",
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch = !search || 
        l.name.toLowerCase().includes(search.toLowerCase()) || 
        (l.company?.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    });
  }, [leads, search]);

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
    
    // Validation using our real required fields from the DB
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

    // AI Automation: Check for trigger campaigns
    const triggerCampaigns = campaigns.filter(c => c.trigger_stage_id === destinationStageId);
    if (triggerCampaigns.length > 0) {
      toast.info(`Automating AI messages for ${activeLead.name}...`);
      for (const campaign of triggerCampaigns) {
        generateSDRMessages(activeLead, campaign).catch(console.error);
      }
    }
  };

  const handleAddLead = async () => {
    if (!currentWorkspace || !user) return;
    setIsCreating(true);
    try {
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
        custom_data: {},
      });
      
      // AI Automation check for initial creation
      if (baseStage?.id && createdLead) {
        const triggerCampaigns = campaigns.filter(c => c.trigger_stage_id === baseStage.id);
        if (triggerCampaigns.length > 0) {
          toast.info(`Automating AI messages for ${createdLead.name}...`);
          for (const campaign of triggerCampaigns) {
             generateSDRMessages(createdLead, campaign).catch(console.error);
          }
        }
      }

      setNewLead({ name: "", email: "", phone: "", company: "", role: "", origin: "LinkedIn", notes: "" });
      setSheetOpen(false);
    } finally {
      setIsCreating(false);
    }
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-lg font-medium text-foreground">Leads</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-52 bg-muted border-border text-sm"
            />
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                <Plus className="h-3.5 w-3.5" /> Add Lead
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border">
              <SheetHeader>
                <SheetTitle className="text-foreground">Add New Lead</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {(["name", "email", "phone", "company", "role"] as const).map((field) => (
                  <div key={field} className="space-y-1.5">
                    <Label className="capitalize text-sm">{field}</Label>
                    <Input
                      value={newLead[field]}
                      onChange={(e) => setNewLead({ ...newLead, [field]: e.target.value })}
                      className="bg-muted border-border"
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label className="text-sm">Origin</Label>
                  <Select value={newLead.origin} onValueChange={(v) => setNewLead({ ...newLead, origin: v })}>
                    <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["LinkedIn", "Inbound", "Referral", "Cold Outreach", "Event"].map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Notes</Label>
                  <Textarea value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} className="bg-muted border-border" />
                </div>
                <Button 
                  onClick={handleAddLead} 
                  disabled={isCreating}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Lead"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full">
            {stages.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage_id === stage.id);
              return (
                <KanbanColumn key={stage.id} stageId={stage.id} stageName={stage.name} leads={stageLeads}>
                  {stageLeads.map((lead) => (
                    <DraggableLeadCard key={lead.id} lead={lead} />
                  ))}
                </KanbanColumn>
              );
            })}
          </div>
          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <Dialog open={!!missingFields} onOpenChange={(o) => !o && setMissingFields(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot move lead</DialogTitle>
            <DialogDescription>
              {missingFields?.leadName} is missing required fields for the "{missingFields?.destination}" stage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <h4 className="text-sm font-medium">Missing fields:</h4>
            <ul className="list-disc pl-5 text-sm text-destructive">
              {missingFields?.fields.map(f => (
                <li key={f} className="capitalize">{f}</li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setMissingFields(null)}>Close</Button>
            <Button variant="secondary" onClick={() => {
              const id = activeLead?.id;
              setMissingFields(null);
              if (id) navigate(`/leads/${id}`);
            }}>Edit Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
