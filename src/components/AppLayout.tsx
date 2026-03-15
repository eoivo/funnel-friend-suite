import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AppLayout() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse sidebar on smaller desktop screens
  useEffect(() => {
    if (!isMobile && window.innerWidth < 1280) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background transition-colors duration-300">
      {isMobile ? (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 border-none w-72 bg-background">
            <AppSidebar collapsed={false} onSelect={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      ) : (
        <AppSidebar collapsed={collapsed} />
      )}
      
      <main className="flex-1 overflow-auto relative">
        <Outlet context={{ 
          collapsed, 
          setCollapsed, 
          isMobile, 
          mobileOpen, 
          setMobileOpen 
        }} />
      </main>
    </div>
  );
}
