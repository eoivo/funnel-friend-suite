import { SidebarToggle } from "./SidebarToggle";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Building2 } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  const { currentWorkspace, isLoading } = useWorkspaces();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:py-3.5 sm:pl-3 sm:pr-8 border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-20 gap-4">
      <div className="flex items-center">
        <div className="flex items-center">
          <SidebarToggle />
        </div>
        <div className="ml-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-none font-['Syne']">
              {title}
            </h1>
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md">
              <Building2 className="h-3 w-3 text-primary/70" />
              <span className="text-[10px] font-black text-primary/80 uppercase tracking-wider truncate max-w-[120px]">
                {isLoading ? "Carregando..." : (currentWorkspace?.name || "Workspace")}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-[10px] sm:text-[12px] mt-0 font-medium line-clamp-1 sm:line-clamp-none opacity-80">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {children}
      </div>
    </div>
  );
}
