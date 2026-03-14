export interface CustomField {
  id: string;
  name: string;
  key: string;
  type: "text" | "number" | "select";
  options?: string[];
}

export const mockCustomFields: CustomField[] = [
  {
    id: "cf-1",
    name: "Segment",
    key: "segment",
    type: "select",
    options: ["SaaS", "FinTech", "E-commerce", "AI/ML", "DevTools", "MarTech", "HR Tech", "Cloud Infrastructure", "RevOps", "SalesTech", "Customer Experience", "Automation", "Data Analytics", "Marketing Agency"],
  },
  {
    id: "cf-2",
    name: "Annual Revenue",
    key: "annualRevenue",
    type: "select",
    options: ["<$1M", "$1M-$5M", "$5M-$10M", "$10M-$50M", "$50M+"],
  },
  {
    id: "cf-3",
    name: "Team Size",
    key: "teamSize",
    type: "number",
  },
];
