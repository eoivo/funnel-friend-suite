import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg.jpg";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Could not create account");

      const userId = authData.user.id;
      const slug = workspaceName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

      // 2. Create Workspace
      const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({ name: workspaceName, slug })
        .select()
        .single();

      if (wsError) throw wsError;

      // 3. Add as Admin Member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: userId,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // 4. Seed Default Stages
      const { error: rpcError } = await supabase.rpc('seed_default_stages', { 
        p_workspace_id: workspace.id 
      });

      if (rpcError) throw rpcError;
      
      toast.success("Workspace created! Please check your email and sign in.");
      navigate("/login");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
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
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="bg-muted border-border h-12 rounded-xl focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-medium px-5"
              />
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
