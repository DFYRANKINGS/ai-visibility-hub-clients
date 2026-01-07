import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";
import ProfilePage from "@/pages/ProfilePage";

export default function Index() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setAuthSubmitting(true);
    const { error } = isLogin
      ? await signIn(cleanEmail, password)
      : await signUp(cleanEmail, password);
    setAuthSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (!isLogin) {
      toast({
        title: "Check your email",
        description:
          "We sent you a confirmation link. Please verify your account, then sign in.",
      });
      setIsLogin(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Single public route: show auth UI when logged out; show the full profile wizard when logged in.
  if (user) return <ProfilePage />;

  return (
    <main className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary-foreground whitespace-nowrap">
            Complete Your AI Visibility Profile
          </h1>
          <p className="text-primary-foreground/80 text-xl mt-2 inline-flex items-center gap-1">
            <ArrowRight className="w-5 h-5" /> Return Anytime to Add Information
          </p>
          <p className="text-primary-foreground/50 text-lg mt-1">Client Portal Sign-in</p>
        </header>

        <article className="bg-card rounded-2xl shadow-card p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <form onSubmit={handleAuthSubmit} className="space-y-4" aria-label="Authentication form">
            <FormField label="Email">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </FormField>

            <FormField label="Password">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={authSubmitting}>
              {authSubmitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

