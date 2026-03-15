import { useTheme } from "@/contexts/ThemeContext";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border/50 group-[.toaster]:shadow-sdr-md rounded-2xl p-4 flex gap-3 font-['DM_Sans']",
          title: "font-['Syne'] font-bold text-[15px] text-foreground tracking-tight",
          description: "group-[.toast]:text-muted-foreground text-[13px] font-medium mt-1 leading-relaxed",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-black group-[.toast]:font-bold group-[.toast]:uppercase tracking-widest text-[10px] rounded-xl px-4 py-2 hover:bg-primary/90 transition-colors",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground hover:bg-muted-foreground/20 rounded-xl px-4 py-2 transition-colors",
          closeButton: "group-[.toast]:!bg-transparent group-[.toast]:!text-muted-foreground hover:group-[.toast]:!bg-muted hover:group-[.toast]:!text-foreground transition-all !border-none !left-[unset] !right-2 !top-1/2 !-translate-y-1/2 !translate-x-0 [&_svg]:!w-4 [&_svg]:!h-4",
          success: "group-[.toast]:text-emerald-500",
          error: "group-[.toast]:text-destructive",
          info: "group-[.toast]:text-blue-500",
          warning: "group-[.toast]:text-amber-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
