import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";

export function SidebarToggle() {
  const { collapsed, setCollapsed, isMobile, setMobileOpen } = useOutletContext<{ 
    collapsed: boolean; 
    setCollapsed: (v: boolean) => void;
    isMobile: boolean;
    setMobileOpen: (v: boolean) => void;
  }>();

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(true);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-11 w-11 text-muted-foreground hover:text-primary transition-all rounded-xl mr-1 group bg-transparent hover:bg-transparent border-none shadow-none focus-visible:ring-0"
      onClick={handleToggle}
    >
      <Menu className={cn(
        "h-8 w-8 transition-transform group-hover:scale-110",
        (!isMobile && !collapsed) ? "text-primary shadow-glow" : ""
      )} />
    </Button>
  );
}
