import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/FormField';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get agency_id from URL (direct link from agency)
  const agencyIdFromUrl = searchParams.get('agency_id');
  
  // Store agency_id in localStorage when present in URL
  useEffect(() => {
    if (agencyIdFromUrl) {
      localStorage.setItem('agency_user_id', agencyIdFromUrl);
    }
  }, [agencyIdFromUrl]);
  
  const hasValidAgencyId = agencyIdFromUrl || localStorage.getItem('agency_user_id');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      if (!isLogin) {
        toast({ title: 'Success', description: 'Account created! You can now sign in.' });
        setIsLogin(true);
      } else {
        navigate('/profile');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">AI Visibility Profile</h1>
          <p className="text-primary-foreground/70 mt-2">Client Portal</p>
        </div>

        {!hasValidAgencyId && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-destructive font-medium">Invalid Access</p>
              <p className="text-xs text-destructive/80 mt-1">Please use the link provided by your agency to access this portal.</p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-card p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email">
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>

            <FormField label="Password">
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !hasValidAgencyId}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
