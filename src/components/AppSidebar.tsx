import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Campanhas", href: "/campaigns", icon: Send },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export function AppSidebar({ collapsed, onSelect }: { collapsed: boolean; onSelect?: () => void }) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const initials = user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <aside
      className={`h-screen flex flex-col border-r border-border sidebar-gradient transition-all duration-300 ease-in-out z-30 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo - Ajustado para alinhar melhor com o header */}
      <div className={`flex items-center gap-3 px-5 pt-8 pb-6 border-b border-border/10 ${collapsed ? "justify-center" : ""}`}>
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-glow">
          <Zap className="h-5 w-5 text-primary fill-primary/20" />
        </div>
        {!collapsed && (
          <span className="font-['Syne'] font-extrabold text-foreground tracking-[0.2em] text-[13px] animate-fade-in uppercase">
            SDR <span className="text-primary italic">FLOW</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1.5 p-3 mt-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              onClick={onSelect}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-all duration-200 group relative"
              activeClassName="bg-primary/10 text-primary font-bold shadow-sdr-sm border border-primary/10"
            >
              <item.icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-primary shadow-glow" : ""}`} />
              {!collapsed && <span className="text-sm tracking-tight">{item.label}</span>}
              {!collapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/10 p-4 bg-muted/10">
        {user && (
          <div className={`flex items-center gap-3 rounded-xl border border-transparent hover:border-border/10 transition-all p-1.5 mb-2 ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="h-9 w-9 ring-2 ring-primary/5 shadow-sdr-sm">
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-foreground leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-medium opacity-60">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="sm"
                className={`flex-1 h-9 text-muted-foreground hover:text-primary transition-colors uppercase text-[10px] font-bold tracking-widest ${collapsed ? "px-0" : ""}`}
                onClick={toggleTheme}
            >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5 mr-2" /> : <Moon className="h-3.5 w-3.5 mr-2" />}
                {!collapsed && (theme === "dark" ? "Modo Claro" : "Modo Escuro")}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={`flex-1 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors uppercase text-[10px] font-bold tracking-widest ${collapsed ? "px-0" : ""}`}
                onClick={() => signOut()}
            >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                {!collapsed && "Sair"}
            </Button>
        </div>
      </div>
    </aside>
  );
}
