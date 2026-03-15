import { SidebarToggle } from "./SidebarToggle";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 sm:px-8 border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-20 gap-4">
      <div className="flex items-start">
        <div className="mt-1">
          <SidebarToggle />
        </div>
        <div className="ml-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-none font-['Syne']">
            {title}
          </h1>
          <p className="text-muted-foreground text-[11px] sm:text-[13px] mt-1.5 sm:mt-2 font-medium line-clamp-1 sm:line-clamp-none">
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
