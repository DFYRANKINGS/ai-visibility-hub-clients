import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/FormField';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, updatePassword, user } = useAuth();
  const navigate = useNavigate();

  // Handle recovery flow from email link
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setMode('reset');
    }
  }, [searchParams]);

  // Redirect authenticated users (but not during password reset)
  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/profile');
    }
  }, [user, mode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'forgot') {
      if (!email) {
        toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ 
          title: 'Check your email', 
          description: 'We sent you a password reset link. Please check your email.',
        });
        setMode('login');
      }
      return;
    }

    if (mode === 'reset') {
      if (!password || !confirmPassword) {
        toast({ title: 'Error', description: 'Please fill in both password fields', variant: 'destructive' });
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const { error } = await updatePassword(password);
      setLoading(false);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Your password has been updated.' });
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        navigate('/profile');
      }
      return;
    }

    // Login or signup
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { error } = mode === 'login' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      if (mode === 'signup') {
        toast({ 
          title: 'Check your email', 
          description: 'We sent you a confirmation link. Please check your email and click the link to verify your account before signing in.',
        });
        setMode('login');
      } else {
        navigate('/profile');
      }
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'Set New Password';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Please wait...';
    switch (mode) {
      case 'login': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Send Reset Link';
      case 'reset': return 'Update Password';
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

        <div className="bg-card rounded-2xl shadow-card p-8">
          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => { setMode('login'); setPassword(''); setConfirmPassword(''); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          )}

          <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
            {getTitle()}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'reset' && (
              <FormField label="Email">
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </FormField>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <FormField label="Password">
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pr-10" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>
            )}

            {mode === 'reset' && (
              <>
                <FormField label="New Password">
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="pr-10" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormField>
                <FormField label="Confirm Password">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                </FormField>
              </>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => setMode('forgot')} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {getButtonText()}
            </Button>
          </form>

          {(mode === 'login' || mode === 'signup') && (
            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
