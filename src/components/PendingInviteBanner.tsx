import { useState } from "react";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PendingInviteBanner() {
  const { pendingInvites, acceptInvite, rejectInvite } = useWorkspaces();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (pendingInvites.length === 0) return null;

  const handleAction = async (memberId: string, action: 'accept' | 'reject') => {
    setProcessingId(memberId);
    try {
      if (action === 'accept') {
        await acceptInvite(memberId);
        toast.success("Convite aceito! Bem-vindo à equipe.");
      } else {
        await rejectInvite(memberId);
        toast.success("Convite recusado.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar convite.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full p-4 space-y-3">
      {pendingInvites.map((invite) => (
        <Card key={invite.member_id} className="p-4 border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Você foi convidado para participar de <span className="text-primary">{invite.name}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Deseja aceitar o convite e acessar as funções deste time?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 sm:flex-none border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive h-9 font-bold"
              onClick={() => handleAction(invite.member_id, 'reject')}
              disabled={!!processingId}
            >
              {processingId === invite.member_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              Recusar
            </Button>
            <Button 
              size="sm" 
              className="flex-1 sm:flex-none bg-primary text-black hover:bg-primary/90 shadow-glow h-9 font-bold"
              onClick={() => handleAction(invite.member_id, 'accept')}
              disabled={!!processingId}
            >
              {processingId === invite.member_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Aceitar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
