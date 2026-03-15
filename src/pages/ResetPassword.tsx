import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, Zap, LockKeyhole, Eye, EyeOff, Check } from "lucide-react";
import { translateAuthError } from "@/utils/errors";
import heroBg from "@/assets/hero-bg.jpg.jpg";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sessionValida, setSessionValida] = useState(true);
  const navigate = useNavigate();

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordSecure = hasMinLength && hasUpperCase && hasSpecialChar;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    
    // Check if the user arrived with a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // In Supabase, the user should be logged in automatically by the hash fragment in the URL
        // If they are not, the link is invalid or expired
        supabase.auth.onAuthStateChange((event) => {
           if (event === "PASSWORD_RECOVERY") {
               setSessionValida(true);
           }
        });
      }
    });

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    if (!isPasswordSecure) {
      toast.error("Por favor, crie uma senha que atenda aos requisitos de segurança.");
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      toast.success("Senha atualizada com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(translateAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  if (!sessionValida) {
     return (
        <div className="dark min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
           <div className="text-center space-y-4 max-w-sm px-4">
              <div className="mx-auto h-16 w-16 bg-destructive/20 border border-destructive rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_hsl(var(--destructive)/0.3)]">
                 <LockKeyhole className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-['Syne'] font-bold">Link Inválido/Expirado</h2>
              <p className="text-muted-foreground">Este link de recuperação expirou ou é inválido. Por favor, solicite a alteração novamente.</p>
              <Button onClick={() => navigate("/forgot-password")} className="w-full mt-4 h-12 uppercase font-bold tracking-widest bg-primary text-black">
                 Solicitar Novo Link
              </Button>
           </div>
        </div>
     );
  }

  return (
    <div className="dark min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground font-['DM_Sans'] py-8 lg:py-0">
      
      {/* Left Side: Immersive Hero */}
      <div className="flex-[0.6] lg:flex-[1.1] p-8 lg:p-20 flex flex-col justify-between relative overflow-hidden bg-card min-h-[400px] lg:min-h-0">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'screen'
          }}
        />
        {/* Deep Gradient Overlay */}
        <div className="absolute inset-0 z-1 bg-gradient-to-tr from-background via-transparent to-primary/5" />
        
        {/* Brand Header */}
        <div className="relative z-10 animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Zap className="h-6 w-6 text-black fill-black/10" />
            </div>
            <span className="font-['Syne'] font-extrabold text-2xl text-foreground tracking-[0.2em] uppercase">
              SDR <span className="text-primary italic">FLOW</span>
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl animate-slide-up mt-12 lg:mt-0">
          <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-6 lg:mb-8 backdrop-blur-sm">
            Redefinição de Senha
          </div>
          <h1 className="font-['Syne'] font-bold text-4xl sm:text-5xl lg:text-[72px] text-foreground leading-[0.95] mb-6 lg:mb-8 tracking-tighter">
            CRIE SUA<br className="hidden sm:block"/>NOVA SENHA<br/><span className="text-primary italic">SEGURA.</span>
          </h1>
          <p className="text-muted-foreground text-base lg:text-xl leading-relaxed max-w-md font-light">
            Você está a um passo de recuperar o controle do seu pipeline.
          </p>
        </div>

        {/* Feature Highlights - Desktop Only or sm+ */}
        <div className="relative z-10 hidden sm:grid grid-cols-3 gap-8 pt-12 border-t border-border animate-fade-in delay-300">
          <div className="space-y-1">
            <div className="font-['Syne'] font-bold text-2xl lg:text-3xl text-primary">3×</div>
            <div className="text-[9px] lg:text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Mais<br/>Conversão</div>
          </div>
          <div className="space-y-1">
            <div className="font-['Syne'] font-bold text-2xl lg:text-3xl text-primary/80">80%</div>
            <div className="text-[9px] lg:text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Menos<br/>Esforço</div>
          </div>
          <div className="space-y-1">
            <div className="font-['Syne'] font-bold text-2xl lg:text-3xl text-primary/60">FLASH</div>
            <div className="text-[9px] lg:text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Agilidade<br/>Total</div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 bg-background p-8 lg:p-20 flex flex-col justify-center relative border-t lg:border-t-0 lg:border-l border-border">
        <div className="max-w-md mx-auto w-full animate-fade-in space-y-8 sm:space-y-10">
          <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-['Syne'] font-bold text-white tracking-tight">Redefinição</h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Digite e confirme a sua nova senha abaixo.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6 sm:space-y-8">
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] ml-1">Nova Senha</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="bg-muted border-border h-14 rounded-2xl focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-medium text-base px-6 pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {hasMinLength ? <Check className="h-3 w-3 text-primary" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 ml-0.5" />}
                    <span className={hasMinLength ? "text-primary font-bold" : "text-muted-foreground"}>Mínimo de 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {hasUpperCase ? <Check className="h-3 w-3 text-primary" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 ml-0.5" />}
                    <span className={hasUpperCase ? "text-primary font-bold" : "text-muted-foreground"}>1 letra maiúscula</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {hasSpecialChar ? <Check className="h-3 w-3 text-primary" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 ml-0.5" />}
                    <span className={hasSpecialChar ? "text-primary font-bold" : "text-muted-foreground"}>1 caractere especial (!@#$%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] ml-1">Confirme a Senha</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    required
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="bg-muted border-border h-14 rounded-2xl focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-medium text-base px-6 pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-black hover:bg-primary/90 font-['Syne'] font-extrabold h-14 rounded-2xl shadow-glow text-lg transition-all active:scale-[0.98] uppercase tracking-[0.1em]"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-black" /> : "Salvar e Entrar"}
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
