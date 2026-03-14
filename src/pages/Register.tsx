import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-primary tracking-tighter text-2xl">SDR FLOW</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sdr-md">
          <h1 className="text-lg font-medium text-foreground mb-1">Create your workspace</h1>
          <p className="text-muted-foreground text-sm mb-6">Start converting leads faster</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace Name</Label>
              <Input id="workspace" required value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Workspace"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
