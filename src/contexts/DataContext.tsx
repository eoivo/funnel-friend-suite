import React, { createContext, useContext, useState, ReactNode } from "react";
import { Lead, LeadStage, mockLeads } from "@/mock/mockLeads";
import { Campaign, mockCampaigns } from "@/mock/mockCampaigns";
import { CustomField, mockCustomFields } from "@/mock/mockCustomFields";

interface DataContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  customFields: CustomField[];
  setCustomFields: React.Dispatch<React.SetStateAction<CustomField[]>>;
  updateLeadStage: (leadId: string, stage: LeadStage) => void;
  addLead: (lead: Lead) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [customFields, setCustomFields] = useState<CustomField[]>(mockCustomFields);

  const updateLeadStage = (leadId: string, stage: LeadStage) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage, lastActivity: new Date().toISOString() } : l)));
  };

  const addLead = (lead: Lead) => {
    setLeads((prev) => [lead, ...prev]);
  };

  return (
    <DataContext.Provider value={{ leads, setLeads, campaigns, setCampaigns, customFields, setCustomFields, updateLeadStage, addLead }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
