import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Zap, ArrowLeft, MailCheck } from "lucide-react";
import { translateAuthError } from "@/utils/errors";
import heroBg from "@/assets/hero-bg.jpg.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
      toast.success("E-mail de recuperação enviado!");
      setEmail("");
    } catch (error: any) {
      toast.error(translateAuthError(error));
    } finally {
      setLoading(false);
    }
  };

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
            Recuperação de Acesso
          </div>
          <h1 className="font-['Syne'] font-bold text-4xl sm:text-5xl lg:text-[72px] text-foreground leading-[0.95] mb-6 lg:mb-8 tracking-tighter">
            RECUPERE<br className="hidden sm:block"/>O SEU<br/><span className="text-primary italic">ACESSO.</span>
          </h1>
          <p className="text-muted-foreground text-base lg:text-xl leading-relaxed max-w-md font-light">
            Enviaremos um link seguro para você redefinir sua senha e voltar a fechar negócios.
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
        {/* Back Button */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 lg:top-10 lg:right-10 z-20">
          <Link to="/login" className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl border border-border">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>

        <div className="max-w-md mx-auto w-full animate-fade-in space-y-8 sm:space-y-10">
          <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-['Syne'] font-bold text-white tracking-tight">Esqueci minha senha</h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Digite o e-mail associado à sua conta.
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center space-y-6 text-center py-8">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 shadow-glow animate-fade-in">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-['Syne'] text-white">E-mail Enviado!</h3>
                <p className="text-muted-foreground text-sm max-w-[280px]">
                  Verifique a caixa de entrada do e-mail <br/> <strong className="text-primary font-bold">{email}</strong> com as instruções.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/login")}
                className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 h-14 rounded-2xl font-bold uppercase tracking-widest mt-4"
              >
                Voltar para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6 sm:space-y-8">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.2em] ml-1">Seu E-mail</Label>
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
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-black hover:bg-primary/90 font-['Syne'] font-extrabold h-14 rounded-2xl shadow-glow text-lg transition-all active:scale-[0.98] uppercase tracking-[0.1em]"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin text-black" /> : "Enviar Link de Acesso"}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Lembrou da senha?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
