export interface Activity {
  id: string;
  leadId: string;
  userId: string;
  type: "stage_change" | "note" | "message_sent" | "email" | "call";
  description: string;
  timestamp: string;
}

export const mockActivities: Activity[] = [
  { id: "act-1", leadId: "lead-1", userId: "user-1", type: "stage_change", description: "Moved from Base to Lead Mapeado", timestamp: "2024-01-15T10:00:00Z" },
  { id: "act-2", leadId: "lead-1", userId: "user-1", type: "note", description: "Added notes about Q1 budget approval", timestamp: "2024-01-14T16:00:00Z" },
  { id: "act-3", leadId: "lead-2", userId: "user-1", type: "message_sent", description: "Sent outreach via Cold Outreach — SaaS Leaders campaign", timestamp: "2024-01-14T14:30:00Z" },
  { id: "act-4", leadId: "lead-2", userId: "user-1", type: "email", description: "Follow-up email sent", timestamp: "2024-01-13T11:00:00Z" },
  { id: "act-5", leadId: "lead-3", userId: "user-2", type: "stage_change", description: "Moved from Tentando Contato to Conexão Iniciada", timestamp: "2024-01-13T09:15:00Z" },
  { id: "act-6", leadId: "lead-4", userId: "user-1", type: "call", description: "Discovery call — 30 min. Budget confirmed.", timestamp: "2024-01-12T16:45:00Z" },
  { id: "act-7", leadId: "lead-5", userId: "user-2", type: "stage_change", description: "Moved to Reunião Agendada — demo next Tuesday", timestamp: "2024-01-11T11:00:00Z" },
  { id: "act-8", leadId: "lead-4", userId: "user-1", type: "stage_change", description: "Moved from Conexão Iniciada to Qualificado", timestamp: "2024-01-11T10:00:00Z" },
  { id: "act-9", leadId: "lead-8", userId: "user-1", type: "stage_change", description: "Moved to Desqualificado — no budget, too small", timestamp: "2024-01-10T13:20:00Z" },
  { id: "act-10", leadId: "lead-10", userId: "user-1", type: "message_sent", description: "LinkedIn connection request sent", timestamp: "2024-01-12T10:45:00Z" },
];
