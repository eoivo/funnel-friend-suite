import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Send,
  Settings,
  LogOut,
  Zap,
  Sun,
  Moon,
  ChevronsUpDown,
  Check,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Campanhas", href: "/campaigns", icon: Send },
  { label: "Equipe", href: "/team", icon: Zap, adminOnly: true },
  { label: "Configurações", href: "/settings", icon: Settings, adminOnly: true },
];

export function AppSidebar({ collapsed, isMobile, onSelect }: { collapsed: boolean; isMobile?: boolean; onSelect?: () => void }) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspaces();
  const location = useLocation();

  const isAdmin = currentWorkspace?.role === 'admin';
  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const initials = user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <aside
      className={cn(
        "h-screen flex flex-col sidebar-gradient transition-all duration-300 ease-in-out z-30",
        !isMobile && "border-r border-border",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Workspace Switcher */}
      <div className={`px-4 pt-6 pb-4 border-b border-border/10 ${collapsed ? "flex justify-center" : ""}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full p-2 h-auto hover:bg-primary/5 transition-all group overflow-hidden",
                collapsed ? "w-12 h-12 p-0 rounded-xl flex justify-center border border-border/5" : "rounded-2xl border border-border/5"
              )}
            >
              <div className={cn(
                "flex items-center",
                collapsed ? "justify-center" : "gap-3 w-full"
              )}>
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-glow group-hover:scale-105 transition-transform">
                  {currentWorkspace?.name ? (
                    <span className="font-black text-primary text-[10px] uppercase tracking-tighter">
                      {currentWorkspace.name.slice(0, 2)}
                    </span>
                  ) : (
                    <Zap className="h-4.5 w-4.5 text-primary fill-primary/20" />
                  )}
                </div>
                <div className={cn(
                  "flex flex-col items-start overflow-hidden text-left flex-1 sidebar-label-fade",
                  collapsed ? "sidebar-label-hidden absolute opacity-0 pointer-events-none" : "sidebar-label-visible relative opacity-100"
                )}>
                  <span className="font-['Syne'] font-black text-foreground tracking-widest text-[11px] uppercase truncate w-full leading-none mb-1">
                    {currentWorkspace?.name || "Workspace"}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-60 flex items-center gap-1">
                    Ambiente Ativo <ChevronsUpDown className="h-2 w-2" />
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 glass-card border-primary/10 animate-in fade-in zoom-in duration-200">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-3 pt-2">
              Seus Workspaces
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                className={`p-3 cursor-pointer flex items-center gap-3 transition-colors ${currentWorkspace?.id === ws.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"}`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center border text-[10px] font-black uppercase ${currentWorkspace?.id === ws.id ? "bg-primary/20 border-primary/30" : "bg-muted border-border/50 text-muted-foreground"}`}>
                  {ws.name?.slice(0, 2)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs truncate">{ws.name}</span>
                  <span className="text-[9px] opacity-60 uppercase font-bold tracking-tighter">{ws.role === 'admin' ? 'Admin' : 'Membro'}</span>
                </div>
                {currentWorkspace?.id === ws.id && (
                  <Check className="h-3.5 w-3.5 ml-auto text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1.5 p-3 mt-6">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              onClick={onSelect}
              className={cn(
                "flex items-center rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-all duration-200 group relative",
                collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5 gap-3"
              )}
              activeClassName="bg-primary/10 text-primary font-bold shadow-sdr-sm border border-primary/10"
            >
              <item.icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-primary shadow-glow" : ""}`} />
              <span className={cn(
                "text-sm tracking-tight sidebar-label-fade",
                collapsed ? "sidebar-label-hidden absolute opacity-0 pointer-events-none" : "sidebar-label-visible relative opacity-100 ml-3"
              )}>
                {item.label}
              </span>
              <div className={cn(
                "ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] transition-all duration-500",
                (!isActive || collapsed) ? "opacity-0 scale-0 absolute" : "opacity-100 scale-100"
              )} />
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/10 p-4 bg-muted/10">
        {user && (
          <div className={cn(
            "flex items-center rounded-xl border border-transparent hover:border-border/10 transition-all p-1.5 mb-2",
            collapsed ? "justify-center mb-4" : "gap-3"
          )}>
            <Avatar className="h-9 w-9 ring-2 ring-primary/5 shadow-sdr-sm">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex-1 min-w-0 sidebar-label-fade",
              collapsed ? "sidebar-label-hidden absolute opacity-0 pointer-events-none" : "sidebar-label-visible relative opacity-100 ml-3"
            )}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-xs font-bold truncate text-foreground leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                {currentWorkspace?.role && (
                  <Badge variant={currentWorkspace.role === 'admin' ? 'default' : 'secondary'} className="h-3.5 px-1 py-0 text-[7px] font-black uppercase tracking-tighter rounded-md shrink-0 border-transparent">
                    {currentWorkspace.role === 'admin' ? <Shield className="h-2 w-2 mr-0.5" /> : <UserCircle className="h-2 w-2 mr-0.5" />}
                    {currentWorkspace.role === 'admin' ? 'Adm' : 'Mbr'}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate font-medium opacity-60">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <div className={cn(
          "flex items-center",
          collapsed ? "flex-col gap-2" : "gap-1"
        )}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-primary transition-colors uppercase text-[10px] font-bold tracking-widest flex items-center",
              collapsed ? "h-10 w-10 px-0 rounded-xl justify-center mx-auto" : "flex-1 h-10 justify-start px-3"
            )}
            onClick={toggleTheme}
          >
            <div className="flex items-center justify-center shrink-0">
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </div>
            <span className={cn(
              "sidebar-label-fade",
              collapsed ? "sidebar-label-hidden absolute opacity-0 pointer-events-none ml-0" : "sidebar-label-visible relative opacity-100 ml-2"
            )}>
              {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors uppercase text-[10px] font-bold tracking-widest flex items-center",
              collapsed ? "h-10 w-10 px-0 rounded-xl justify-center mx-auto" : "flex-1 h-10 justify-start px-3"
            )}
            onClick={() => signOut()}
          >
            <div className="flex items-center justify-center shrink-0">
              <LogOut className="h-4.5 w-4.5" />
            </div>
            <span className={cn(
              "sidebar-label-fade",
              collapsed ? "sidebar-label-hidden absolute opacity-0 pointer-events-none ml-0" : "sidebar-label-visible relative opacity-100 ml-2"
            )}>
              Sair
            </span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
