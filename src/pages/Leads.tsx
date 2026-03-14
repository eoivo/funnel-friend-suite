import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Lead, LeadStage, STAGES } from "@/mock/mockLeads";
import { mockUsers } from "@/mock/mockUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function KanbanColumn({ stage, leads, children }: { stage: LeadStage; leads: Lead[]; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] w-[260px] shrink-0 rounded-lg transition-colors duration-150 ${
        isOver ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-foreground">{stage}</h3>
          <span className="text-[11px] tabular-nums text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {leads.length}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-1 pb-2 min-h-[100px]">{children}</div>
    </div>
  );
}

function LeadCard({ lead, isDragging }: { lead: Lead; isDragging?: boolean }) {
  const navigate = useNavigate();
  const user = mockUsers.find((u) => u.id === lead.responsibleId);
  const daysInStage = Math.floor(
    (Date.now() - new Date(lead.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
  );

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
          <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
        </div>
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
            {user?.avatar || "?"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-muted-foreground tabular-nums">{daysInStage}d in stage</span>
        {lead.customFields.segment && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {lead.customFields.segment}
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const { leads, updateLeadStage, addLead } = useData();
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();

  // New lead form state
  const [newLead, setNewLead] = useState({
    name: "", email: "", phone: "", company: "", role: "", origin: "LinkedIn", notes: "",
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filteredLeads = leads.filter((l) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase());
    const matchUser = filterUser === "all" || l.responsibleId === filterUser;
    return matchSearch && matchUser;
  });

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (e.over && e.active.id !== e.over.id) {
      updateLeadStage(e.active.id as string, e.over.id as LeadStage);
    }
  };

  const handleAddLead = () => {
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      ...newLead,
      stage: "Base",
      responsibleId: "user-1",
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      customFields: {},
    };
    addLead(lead);
    setNewLead({ name: "", email: "", phone: "", company: "", role: "", origin: "LinkedIn", notes: "" });
    setSheetOpen(false);
  };

  const activeLead = leads.find((l) => l.id === activeId);

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
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="h-8 w-40 bg-muted border-border text-sm">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {mockUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <Button onClick={handleAddLead} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Add Lead
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
            {STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stage);
              return (
                <KanbanColumn key={stage} stage={stage} leads={stageLeads}>
                  {stageLeads.map((lead) => (
                    <div key={lead.id} id={lead.id} data-id={lead.id}>
                      <DraggableLeadCard lead={lead} />
                    </div>
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
    </div>
  );
}

function DraggableLeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable(lead.id);
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.3 : 1 }}>
      <LeadCard lead={lead} />
    </div>
  );
}

function useDraggable(id: string) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = require("@dnd-kit/core").useDraggable({ id });
  return { attributes, listeners, setNodeRef, isDragging, transform };
}
