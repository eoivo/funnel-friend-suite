import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { translateAuthError } from "@/utils/errors";
import heroBg from "@/assets/hero-bg.jpg.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Bem-vindo de volta!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(translateAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground font-['DM_Sans']">
      
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
        <div className="relative z-10 max-w-xl animate-slide-up mt-12 lg:mt-0">
          <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-6 lg:mb-8 backdrop-blur-sm">
            Next-Gen AI CRM
          </div>
          <h1 className="font-['Syne'] font-bold text-4xl sm:text-5xl lg:text-[72px] text-foreground leading-[0.95] mb-6 lg:mb-8 tracking-tighter">
            PROSPECTE<br className="hidden sm:block"/>COM ALTA<br/><span className="text-primary italic">PERFORMANCE.</span>
          </h1>
          <p className="text-muted-foreground text-base lg:text-xl leading-relaxed max-w-md font-light">
            Sua central de inteligência para o controle absoluto de prospecção.
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

      {/* Right Side: Authentication Form */}
      <div className="flex-1 bg-background p-8 lg:p-20 flex flex-col justify-center relative border-t lg:border-t-0 lg:border-l border-border">
        <div className="max-w-md mx-auto w-full animate-fade-in">
          <div className="mb-10 lg:mb-12">
            <h3 className="font-['Syne'] font-bold text-3xl lg:text-4xl text-foreground mb-3 tracking-tight">Bem-vindo de volta</h3>
            <p className="text-muted-foreground text-sm lg:text-base">Inicie sua sessão para gerenciar sua operação.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] ml-1">E-mail Corporativo</Label>
              <Input 
                id="email" 
                type="email" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="nome@empresa.com" 
                className="bg-muted border-border h-14 rounded-2xl focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-medium text-base px-6"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Senha de Acesso</Label>
                <Link to="/forgot-password" className="text-[10px] text-primary/60 hover:text-primary transition-colors font-bold uppercase tracking-widest">Esqueceu a senha?</Link>
              </div>
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
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-black hover:bg-primary/90 font-['Syne'] font-extrabold h-14 rounded-2xl shadow-glow text-lg transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.1em]"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin text-black" /> : "Entrar no Painel"}
            </Button>
          </form>

          <p className="text-center text-sm lg:text-base text-muted-foreground mt-10 lg:mt-12 flex items-center justify-center gap-2">
            Novo na plataforma?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4 decoration-2">Crie sua conta</Link>
          </p>

          <div className="mt-16 lg:mt-20 flex items-center justify-center gap-2 text-muted-foreground/30">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
            <span className="text-[9px] lg:text-[10px] uppercase font-bold tracking-[0.3em]">Sessão Criptografada Gemini 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
