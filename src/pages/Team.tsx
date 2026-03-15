import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/useWorkspaces";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, UserCircle, Mail, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TeamPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaces();
  const { data: members = [], isLoading } = useWorkspaceMembers(currentWorkspace?.id);
  const isMobile = useIsMobile();
  const isAdmin = currentWorkspace?.role === 'admin';
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberLeadsCount, setMemberLeadsCount] = useState<number | null>(null);
  const [isCheckingLeads, setIsCheckingLeads] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inviteConfirmation, setInviteConfirmation] = useState<{
    needsConfirmation: boolean;
    message: string;
    userName: string;
  } | null>(null);

  const isAlreadyMember = members.some(m => m.profiles?.email?.toLowerCase() === inviteEmail.toLowerCase());
  const isSelfInvite = inviteEmail.toLowerCase() === user?.email?.toLowerCase();
  const isInviteValid = inviteName.trim().length > 0 && 
                        inviteEmail.trim().length > 0 && 
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail) && 
                        !isSelfInvite &&
                        !isAlreadyMember;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName || !currentWorkspace) return;

    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-member", {
        body: {
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
          workspaceId: currentWorkspace.id,
          confirmExisting: !!inviteConfirmation
        }
      });

      if (error) throw error;

      if (data?.needsConfirmation) {
        setInviteConfirmation(data);
        setIsInviting(false);
        return;
      }
      
      const message = data?.message || `Convite enviado para ${inviteEmail}`;
      toast.success(message, { duration: 6000 });
      
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteConfirmation(null);
      
      // Refresh members list immediately
      queryClient.invalidateQueries({ queryKey: ["workspace_members", currentWorkspace.id] });
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(error.message || "Falha ao enviar convite");
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteClick = async (member: any) => {
    // Cannot delete yourself
    const { data: { user } } = await supabase.auth.getUser();
    if (member.user_id === user?.id) {
      toast.error("Você não pode se auto-excluir.");
      return;
    }

    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
    setIsCheckingLeads(true);

    try {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', currentWorkspace?.id)
        .eq('assigned_to', member.user_id);

      if (error) throw error;
      setMemberLeadsCount(count || 0);
    } catch (error) {
      console.error("Error checking leads:", error);
      toast.error("Erro ao verificar leads do membro.");
    } finally {
      setIsCheckingLeads(false);
    }
  };

  const confirmDelete = async () => {
    if (!memberToDelete || !currentWorkspace) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-member", {
        body: {
          userId: memberToDelete.user_id,
          workspaceId: currentWorkspace.id
        }
      });

      if (error) throw error;

      toast.success("Membro removido totalmente!");
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
      
      // Invalidate queries to refresh list without page reload
      queryClient.invalidateQueries({ queryKey: ["workspace_members", currentWorkspace.id] });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Erro ao remover membro.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-hidden">
      <PageHeader 
        title="Gestão de Equipe" 
        description="Gerencie os membros do seu workspace e seus níveis de acesso."
      >
        {isAdmin && (
          <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2 shadow-glow">
            <UserPlus className="h-4 w-4" /> Convidar Membro
          </Button>
        )}
      </PageHeader>

      <div className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {isMobile ? (
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-5 glass-card border-border animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                members.map((member) => (
                  <Card key={member.id} className="p-5 glass-card border-border flex flex-col gap-4 relative group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/5 shadow-sdr-sm shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-black uppercase">
                            {member.profiles?.full_name?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-foreground text-base tracking-tight truncate">
                            {member.profiles?.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium truncate opacity-70">
                            {member.profiles?.email}
                          </span>
                        </div>
                      </div>
                      
                      {isAdmin && member.user_id !== user?.id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          onClick={() => handleDeleteClick(member)}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="rounded-lg uppercase text-[8px] font-black tracking-widest px-2 py-0.5 border-transparent">
                          {member.role === 'admin' ? (
                            <span className="flex items-center gap-1"><Shield className="h-2.5 w-2.5" /> Admin</span>
                          ) : (
                            <span className="flex items-center gap-1"><UserCircle className="h-2.5 w-2.5" /> Membro</span>
                          )}
                        </Badge>
                        <Badge 
                          variant={member.status === 'active' ? 'outline' : 'secondary'} 
                          className={`rounded-lg uppercase text-[8px] font-black tracking-widest px-2 py-0.5 border-transparent ${
                            member.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20 animate-pulse'
                          }`}
                        >
                          {member.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase opacity-40">
                        {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card className="glass-card border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[300px] text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 px-6">Membro</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 px-6">E-mail</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 px-6">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 px-6">Nível de Acesso</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 px-6">Entrou em</TableHead>
                    {isAdmin && <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 px-6 w-[80px]">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse border-border/50">
                        <TableCell className="py-4 px-6"><div className="h-10 w-40 bg-muted rounded-lg" /></TableCell>
                        <TableCell className="py-4 px-6"><div className="h-4 w-32 bg-muted rounded-lg" /></TableCell>
                        <TableCell className="py-4 px-6"><div className="h-6 w-20 bg-muted rounded-lg" /></TableCell>
                        <TableCell className="py-4 px-6 text-right"><div className="h-4 w-24 bg-muted rounded-lg ml-auto" /></TableCell>
                        {isAdmin && <TableCell className="py-4 px-6 text-right"><div className="h-8 w-8 bg-muted rounded-lg ml-auto" /></TableCell>}
                      </TableRow>
                    ))
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/5 shadow-sdr-sm">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                                {member.profiles?.full_name?.slice(0, 2).toUpperCase() || "??"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">
                              {member.profiles?.full_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-sm text-muted-foreground font-medium opacity-80">{member.profiles?.email}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge 
                            variant={member.status === 'active' ? 'outline' : 'secondary'} 
                            className={`rounded-lg uppercase text-[9px] font-black tracking-widest px-2.5 py-0.5 border-transparent ${
                              member.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20 animate-pulse'
                            }`}
                          >
                            {member.status === 'active' ? 'Ativo' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="rounded-lg uppercase text-[9px] font-black tracking-widest px-2.5 py-0.5 border-transparent">
                            {member.role === 'admin' ? (
                              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</span>
                            ) : (
                              <span className="flex items-center gap-1"><UserCircle className="h-3 w-3" /> Membro</span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <span className="text-xs text-muted-foreground font-medium opacity-60">
                            {new Date(member.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="py-4 px-6 text-right">
                            {member.user_id !== user?.id && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => handleDeleteClick(member)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass-card border-primary/20 p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight font-['Syne']">Convidar para o Time</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Envie um convite por e-mail para um novo colaborador.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleInvite} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
              <Input
                id="name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Ex: João Silva"
                className="bg-muted border-border h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="joao@empresa.com"
                className="bg-muted border-border h-11"
                required
              />
              {isSelfInvite && (
                <p className="text-[10px] text-destructive font-bold uppercase mt-1 ml-1 animate-pulse">
                  Você não pode convidar a si mesmo.
                </p>
              )}
              {isAlreadyMember && (
                <p className="text-[10px] text-destructive font-bold uppercase mt-1 ml-1">
                  Este usuário já é um membro deste time.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nível de Acesso</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-muted border-border h-11">
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro (SDR)</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 font-bold shadow-glow" 
                disabled={isInviting || !isInviteValid}
              >
                {isInviting ? "Enviando..." : "Enviar Convite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] glass-card border-destructive/20 p-8">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold font-['Syne']">Remover Membro?</DialogTitle>
            <DialogDescription className="text-sm font-medium pt-2 text-foreground/70">
              Tem certeza que deseja remover <strong className="text-foreground">{memberToDelete?.profiles?.full_name}</strong> do workspace?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isCheckingLeads ? (
              <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Verificando leads...
              </div>
            ) : memberLeadsCount !== null && memberLeadsCount > 0 ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-black text-destructive uppercase tracking-[0.2em]">Ação Bloqueada</p>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  Este membro possui <strong className="text-destructive">{memberLeadsCount} lead(s)</strong> sob sua responsabilidade. 
                  Para removê-lo, você deve primeiro excluir ou reatribuir esses leads para outro membro na página de Leads.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center font-medium px-4">
                Esta ação removerá o acesso do usuário a este workspace imediatamente.
              </p>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 h-11 font-bold border-border hover:bg-muted text-xs uppercase tracking-widest" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 h-11 font-bold shadow-[0_0_20px_hsl(var(--destructive)/0.2)] text-xs uppercase tracking-widest"
              disabled={isDeleting || isCheckingLeads || (memberLeadsCount !== null && memberLeadsCount > 0)}
              onClick={confirmDelete}
            >
              {isDeleting ? "Removendo..." : "Confirmar Remoção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!inviteConfirmation} onOpenChange={(open) => !open && setInviteConfirmation(null)}>
        <DialogContent className="sm:max-w-[400px] glass-card border-primary/20 p-8">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold font-['Syne']">Usuário já existe</DialogTitle>
            <DialogDescription className="text-sm font-medium pt-2 text-foreground/70 leading-relaxed">
              {inviteConfirmation?.message}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Detalhes</p>
              <p className="text-sm font-bold text-foreground">{inviteConfirmation?.userName}</p>
              <p className="text-xs text-muted-foreground">{inviteEmail}</p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 h-11 font-bold border-border hover:bg-muted text-xs uppercase tracking-widest" 
              onClick={() => {
                setInviteConfirmation(null);
                setInviteEmail("");
                setInviteName("");
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 h-11 font-bold shadow-glow text-xs uppercase tracking-widest"
              onClick={(e) => handleInvite(e as any)}
              disabled={isInviting}
            >
              {isInviting ? "Invitando..." : "Confirmar Convite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
