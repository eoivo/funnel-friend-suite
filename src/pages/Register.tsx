import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import { translateAuthError } from "@/utils/errors";
import heroBg from "@/assets/hero-bg.jpg.jpg";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordSecure = hasMinLength && hasUpperCase && hasSpecialChar;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordSecure) {
      toast.error("Por favor, crie uma senha que atenda aos requisitos de segurança.");
      return;
    }
    setLoading(true);

    try {
      // 1. Sign up the user
      // Workspace and members are now handled by a DB trigger (handle_new_user)
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: name,
            workspace_name: workspaceName
          }
        }
      });

      if (authError) throw authError;

      // 2. Sign out immediately as requested (Ensures they have to log in manually)
      await supabase.auth.signOut();
      
      toast.success("Conta criada! Por favor, faça login com suas credenciais.");
      navigate("/login", { state: { justRegistered: true } });
      
    } catch (error: any) {
      toast.error(translateAuthError(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground font-['DM_Sans'] py-8 lg:py-0">
      
      {/* Left Side: Immersive Hero */}
      <div className="flex-[0.5] lg:flex-[1.1] p-8 lg:p-20 flex flex-col justify-between relative overflow-hidden bg-card min-h-[360px] lg:min-h-0">
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
        <div className="relative z-10 animate-fade-in">
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
        <div className="relative z-10 max-w-xl animate-slide-up mt-8 lg:mt-0">
          <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-6 lg:mb-8 backdrop-blur-sm">
            Scalable Outreach
          </div>
          <h1 className="font-['Syne'] font-bold text-4xl sm:text-5xl lg:text-[72px] text-foreground leading-[0.95] mb-6 lg:mb-8 tracking-tighter">
            CRIE SEU<br className="hidden sm:block"/>PRÓPRIO<br/><span className="text-primary italic">WORKSPACE.</span>
          </h1>
          <p className="text-muted-foreground text-base lg:text-xl leading-relaxed max-w-md font-light">
            Domine o funil de vendas com inteligência artificial.
          </p>
        </div>

        {/* Feature Highlights - Desktop Only */}
        <div className="relative z-10 hidden sm:grid grid-cols-3 gap-8 pt-12 border-t border-border animate-fade-in delay-300">
          <div className="space-y-1">
            <div className="font-['Syne'] font-bold text-2xl lg:text-3xl text-primary">Free</div>
            <div className="text-[9px] lg:text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Start<br/>Now</div>
          </div>
          <div className="space-y-1">
            <div className="font-['Syne'] font-bold text-2xl lg:text-3xl text-primary/80">GenAI</div>
            <div className="text-[9px] lg:text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Gemini 2.0<br/>Ready</div>
          </div>
          <div className="space-y-1">
            <div className="font-['Syne'] font-bold text-2xl lg:text-3xl text-primary/60">Global</div>
            <div className="text-[9px] lg:text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Scale<br/>Fast</div>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex-1 bg-background p-8 lg:p-20 flex flex-col justify-center relative border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
        {/* Back Button */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 lg:top-10 lg:right-10 z-20">
          <Link to="/login" className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl border border-border">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>

        <div className="max-w-md mx-auto w-full animate-fade-in py-8 lg:py-0">
          <div className="mb-8 lg:mb-10">
            <h3 className="font-['Syne'] font-bold text-3xl lg:text-4xl text-foreground mb-3 tracking-tight">Criar Conta</h3>
            <p className="text-muted-foreground text-sm lg:text-base">Inicie sua jornada na prospecção moderna.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
            <div className="space-y-2 lg:space-y-3">
              <Label htmlFor="workspace" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] ml-1">Nome do Workspace</Label>
              <Input 
                id="workspace" 
                required 
                value={workspaceName} 
                onChange={(e) => setWorkspaceName(e.target.value)} 
                placeholder="Ex: SalesForce Team" 
                className="bg-muted border-border h-12 rounded-xl focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-medium px-5"
              />
            </div>
            <div className="space-y-2 lg:space-y-3">
              <Label htmlFor="name" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] ml-1">Seu Nome Completo</Label>
              <Input 
                id="name" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Ivo Fermi" 
                className="bg-muted border-border h-12 rounded-xl focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-medium px-5"
              />
            </div>
            <div className="space-y-2 lg:space-y-3">
              <Label htmlFor="email" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] ml-1">E-mail de Trabalho</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ivo@empresa.com" 
                className="bg-muted border-border h-12 rounded-xl focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-medium px-5"
              />
            </div>
            <div className="space-y-2 lg:space-y-3">
              <Label htmlFor="password" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] ml-1">Senha de Acesso</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="bg-muted border-border h-12 rounded-xl focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-medium px-5 pr-12"
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
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-black hover:bg-primary/90 font-['Syne'] font-extrabold h-14 rounded-2xl shadow-glow text-lg transition-all active:scale-[0.98] mt-6 uppercase tracking-[0.1em]"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin text-black" /> : "Criar Workspace →"}
            </Button>
          </form>

          <p className="text-center text-sm lg:text-base text-muted-foreground mt-8 lg:mt-10">
            Já possui uma conta?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4 decoration-2">Fazer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
