import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { STAGES } from "@/mock/mockLeads";
import { CustomField } from "@/mock/mockCustomFields";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STANDARD_FIELDS = ["name", "email", "phone", "company", "role", "origin"];

export default function SettingsPage() {
  const { customFields, setCustomFields } = useData();
  const [newField, setNewField] = useState({ name: "", type: "text" as "text" | "number" | "select" });
  const [requiredFields, setRequiredFields] = useState<Record<string, string[]>>({});

  const handleAddField = () => {
    if (!newField.name.trim()) {
      toast.error("Field name is required");
      return;
    }
    const field: CustomField = {
      id: `cf-${Date.now()}`,
      name: newField.name,
      key: newField.name.toLowerCase().replace(/\s+/g, ""),
      type: newField.type,
    };
    setCustomFields((prev) => [...prev, field]);
    setNewField({ name: "", type: "text" });
    toast.success("Custom field added");
  };

  const handleRemoveField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    toast.success("Field removed");
  };

  const toggleRequired = (stage: string, field: string) => {
    setRequiredFields((prev) => {
      const current = prev[stage] || [];
      return {
        ...prev,
        [stage]: current.includes(field) ? current.filter((f) => f !== field) : [...current, field],
      };
    });
  };

  const allFields = [...STANDARD_FIELDS, ...customFields.map((f) => f.key)];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-slide-up">
      <h1 className="text-lg font-medium text-foreground mb-6">Settings</h1>

      <Tabs defaultValue="fields" className="w-full">
        <TabsList className="bg-muted border-border mb-6">
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="stages">Funnel Stages</TabsTrigger>
          <TabsTrigger value="required">Required Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="fields">
          <Card className="p-5 bg-card border-border shadow-sdr-sm">
            <h2 className="text-sm font-medium text-foreground mb-4">Custom Fields</h2>
            <div className="space-y-3 mb-6">
              {customFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground">{field.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{field.type}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveField(field.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Field Name</Label>
                <Input value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} className="bg-muted border-border" placeholder="e.g., Industry" />
              </div>
              <div className="w-32 space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={newField.type} onValueChange={(v) => setNewField({ ...newField, type: v as "text" | "number" | "select" })}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddField} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <Card className="p-5 bg-card border-border shadow-sdr-sm">
            <h2 className="text-sm font-medium text-foreground mb-4">Funnel Stages</h2>
            <div className="space-y-2">
              {STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted">
                  <span className="text-xs tabular-nums text-muted-foreground w-5">{i + 1}</span>
                  <span className="text-sm text-foreground">{stage}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Stage order and names will be configurable when connected to a backend.</p>
          </Card>
        </TabsContent>

        <TabsContent value="required">
          <Card className="p-5 bg-card border-border shadow-sdr-sm overflow-x-auto">
            <h2 className="text-sm font-medium text-foreground mb-4">Required Fields per Stage</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Stage</th>
                  {allFields.map((f) => (
                    <th key={f} className="text-center py-2 px-2 text-xs font-medium text-muted-foreground capitalize">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAGES.map((stage) => (
                  <tr key={stage} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-xs text-foreground">{stage}</td>
                    {allFields.map((field) => (
                      <td key={field} className="text-center py-2 px-2">
                        <Checkbox
                          checked={(requiredFields[stage] || []).includes(field)}
                          onCheckedChange={() => toggleRequired(stage, field)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
