import { LeadStage } from "./mockLeads";

export interface Campaign {
  id: string;
  name: string;
  context: string;
  prompt: string;
  triggerStage: LeadStage;
  status: "active" | "paused" | "draft";
  createdAt: string;
  messagesGenerated: number;
}

export const mockCampaigns: Campaign[] = [
  {
    id: "campaign-1",
    name: "Cold Outreach — SaaS Leaders",
    context: "Targeting VP/Director-level sales leaders at B2B SaaS companies ($5M-$50M ARR). Focus on pain points around SDR productivity and outreach personalization.",
    prompt: "Write a concise, personalized outreach message to {{name}} at {{company}}. Mention their role as {{role}} and reference the {{segment}} industry. Keep it under 100 words, professional but conversational. Include a clear CTA for a 15-min call.",
    triggerStage: "Lead Mapeado",
    status: "active",
    createdAt: "2024-01-05T10:00:00Z",
    messagesGenerated: 142,
  },
  {
    id: "campaign-2",
    name: "Follow-Up Sequence — No Reply",
    context: "For leads who haven't responded after 3+ days. These leads are in 'Tentando Contato' stage. Tone should be lighter, shorter, and add urgency without being pushy.",
    prompt: "Write a brief follow-up to {{name}} at {{company}} who hasn't replied. Reference the {{segment}} space. Keep it under 60 words. Be friendly, not desperate. Suggest a specific time for a quick chat.",
    triggerStage: "Tentando Contato",
    status: "active",
    createdAt: "2024-01-08T14:00:00Z",
    messagesGenerated: 89,
  },
  {
    id: "campaign-3",
    name: "Warm Re-engagement — Event Leads",
    context: "Re-engaging leads met at SaaStr and other sales conferences. These leads already know the brand. Focus on what's new and create a reason to reconnect.",
    prompt: "Write a warm message to {{name}} from {{company}} who we met at a recent event. Reference their interest in scaling their SDR operations. Mention a new feature or case study. End with a CTA to schedule a deeper dive.",
    triggerStage: "Conexão Iniciada",
    status: "paused",
    createdAt: "2024-01-12T09:00:00Z",
    messagesGenerated: 34,
  },
];
