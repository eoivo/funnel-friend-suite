import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";

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
      className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-xl mr-2"
      onClick={handleToggle}
    >
      <PanelLeft className={`h-5 w-5 ${(!isMobile && !collapsed) ? "text-primary shadow-glow" : ""}`} />
    </Button>
  );
}
