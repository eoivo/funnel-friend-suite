import { useState, useMemo } from "react";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useFunnelStages } from "@/hooks/useLeads";
import { useCustomFields, useRequiredFields } from "@/hooks/useSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STANDARD_FIELDS = ["name", "email", "phone", "company", "role", "origin"];

export default function SettingsPage() {
  const { currentWorkspace } = useWorkspaces();
  const { data: stages = [], isLoading: isLoadingStages } = useFunnelStages(currentWorkspace?.id);
  const { data: customFields = [], addField, removeField, isLoading: isLoadingFields } = useCustomFields(currentWorkspace?.id);
  const { data: requiredFields = [], toggleRequired } = useRequiredFields(currentWorkspace?.id);
  
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "select">("text");

  const handleAddField = async () => {
    if (!currentWorkspace) return;
    if (!newFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }
    await addField.mutateAsync({
      workspace_id: currentWorkspace.id,
      name: newFieldName,
      field_key: newFieldName.toLowerCase().replace(/\s+/g, "_"),
      field_type: newFieldType,
    });
    setNewFieldName("");
  };

  const handleToggleRequired = async (stageId: string, fieldName: string) => {
    const isCurrentlyRequired = requiredFields.some(r => r.stage_id === stageId && r.field_name === fieldName);
    await toggleRequired.mutateAsync({
      stageId,
      fieldName,
      isRequired: !isCurrentlyRequired
    });
  };

  const allFieldNames = useMemo(() => {
    return [...STANDARD_FIELDS, ...customFields.map((f) => f.field_key)];
  }, [customFields]);

  if (isLoadingStages || isLoadingFields) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              {customFields.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No custom fields added yet.</p>
              ) : (
                customFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground">{field.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{field.field_type}</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive" 
                      onClick={() => removeField.mutate(field.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-3 items-end border-t border-border pt-6 mt-6">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Field Name</Label>
                <Input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="bg-muted border-border" placeholder="e.g., Industry" />
              </div>
              <div className="w-32 space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as "text" | "number" | "select")}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddField} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" /> Add Field
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <Card className="p-5 bg-card border-border shadow-sdr-sm">
            <h2 className="text-sm font-medium text-foreground mb-4">Funnel Stages</h2>
            <div className="space-y-2">
              {stages.map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted">
                  <span className="text-xs tabular-nums text-muted-foreground w-5">{i + 1}</span>
                  <span className="text-sm text-foreground">{stage.name}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto" style={{ borderColor: stage.color, color: stage.color }}>{stage.color}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="required">
          <Card className="p-5 bg-card border-border shadow-sdr-sm overflow-x-auto">
            <h2 className="text-sm font-medium text-foreground mb-4">Required Fields per Stage</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Stage</th>
                    {allFieldNames.map((f) => (
                      <th key={f} className="text-center py-2 px-2 text-xs font-medium text-muted-foreground capitalize">{f}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage) => (
                    <tr key={stage.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-xs text-foreground font-medium">{stage.name}</td>
                      {allFieldNames.map((field) => (
                        <td key={field} className="text-center py-2 px-2">
                          <Checkbox
                            checked={requiredFields.some(r => r.stage_id === stage.id && r.field_name === field)}
                            onCheckedChange={() => handleToggleRequired(stage.id, field)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
