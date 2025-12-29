import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientProfile, FormStep, PracticeArea, MedicalSpecialty } from '@/types/profile';
import { HARDCODED_AGENCY_USER_ID } from '@/lib/constants';
import { FormProgress } from '@/components/FormProgress';
import { EntityStep } from '@/components/steps/EntityStep';
import { ServicesStep } from '@/components/steps/ServicesStep';
import { LegalPracticeAreasStep } from '@/components/steps/LegalPracticeAreasStep';
import { ProductsStep } from '@/components/steps/ProductsStep';
import { FAQsStep } from '@/components/steps/FAQsStep';
import { ArticlesStep } from '@/components/steps/ArticlesStep';
import { ReviewsStep } from '@/components/steps/ReviewsStep';
import { LocationsStep } from '@/components/steps/LocationsStep';
import { TeamStep } from '@/components/steps/TeamStep';
import { AwardsStep } from '@/components/steps/AwardsStep';
import { MediaStep } from '@/components/steps/MediaStep';
import { CasesStep } from '@/components/steps/CasesStep';
import { ReviewStep } from '@/components/steps/ReviewStep';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/FormField';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Send, Sparkles, LogOut, Loader2, Eye, EyeOff } from 'lucide-react';

const steps: FormStep[] = ['entity', 'services', 'products', 'faqs', 'articles', 'reviews', 'locations', 'team', 'awards', 'media', 'cases', 'review'];

export default function Index() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Auth form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Profile form state
  const [currentStep, setCurrentStep] = useState<FormStep>('entity');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<ClientProfile>>({
    services: [], products: [], faqs: [], articles: [], reviews: [],
    locations: [], team_members: [], awards: [], media_mentions: [], case_studies: [],
    practice_areas: [],
    medical_specialties: [],
  });

  // Redirect authenticated users to profile page for sidebar navigation
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/profile');
    }
  }, [user, authLoading, navigate]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setAuthSubmitting(true);
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
    setAuthSubmitting(false);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      if (!isLogin) {
        toast({ 
          title: 'Check your email', 
          description: 'We sent you a confirmation link. Please check your email and click the link to verify your account before signing in.',
        });
        setIsLogin(true);
      }
      // On successful login, useEffect will redirect to /profile
    }
  };

  const currentIndex = steps.indexOf(currentStep);

  const validateEntity = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.entity_name?.trim()) newErrors.entity_name = 'Entity name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (currentStep === 'entity' && !validateEntity()) return;
    if (!completedSteps.includes(currentStep)) setCompletedSteps([...completedSteps, currentStep]);
    if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1]);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1]);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.entity_name?.trim()) {
      toast({ title: 'Error', description: 'Entity name is required', variant: 'destructive' });
      setCurrentStep('entity');
      return;
    }

    setSubmitting(true);

    const { data: existing, error: lookupError } = await supabase
      .from('client_profile')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle();

    if (lookupError) {
      console.log('client_profile lookup error', { message: lookupError.message, code: lookupError.code });
      setSubmitting(false);
      toast({ title: 'Error', description: lookupError.message, variant: 'destructive' });
      return;
    }

    const profilePayload: any = {
      ...(existing?.id ? { id: existing.id } : {}),
      owner_user_id: user.id,
      agency_user_id: HARDCODED_AGENCY_USER_ID,
      entity_name: formData.entity_name,
      legal_name: formData.legal_name || null,
      main_website_url: formData.main_website_url || null,
      short_description: formData.short_description || null,
      long_description: formData.long_description || null,
      hours: formData.hours || null,
      founding_year: formData.founding_year || null,
      team_size: formData.team_size || null,
      address_street: formData.address_street || null,
      address_city: formData.address_city || null,
      address_state: formData.address_state || null,
      address_postal_code: formData.address_postal_code || null,
      phone: formData.phone || null,
      email: formData.email || null,
      same_as: formData.same_as || [],
      services: formData.services || [],
      products: formData.products || [],
      faqs: formData.faqs || [],
      articles: formData.articles || [],
      reviews: formData.reviews || [],
      locations: formData.locations || [],
      team_members: formData.team_members || [],
      awards: formData.awards || [],
      media_mentions: formData.media_mentions || [],
      case_studies: formData.case_studies || [],
    };

    const { data: saved, error: upsertError } = await supabase
      .from('client_profile')
      .upsert(profilePayload)
      .select('id')
      .single();

    console.log('client_profile upsert result', {
      ok: !upsertError,
      id: saved?.id,
      message: upsertError?.message,
      code: (upsertError as any)?.code,
    });

    if (upsertError) {
      setSubmitting(false);
      toast({ title: 'Not saved to database', description: upsertError.message, variant: 'destructive' });
      return;
    }

    try {
      const { error: emailError } = await supabase.functions.invoke('send-profile-email', {
        body: { ...formData, user_email: user.email },
      });
      if (emailError) console.log('Email notification failed', { message: emailError.message });
    } catch (emailErr) {
      console.log('Email notification error', emailErr);
    }

    setSubmitting(false);
    toast({ title: 'Success!', description: 'Your AI Visibility Profile has been saved to the database.' });
    setFormData({ services: [], products: [], faqs: [], articles: [], reviews: [], locations: [], team_members: [], awards: [], media_mentions: [], case_studies: [], practice_areas: [], medical_specialties: [] });
    setCurrentStep('entity');
    setCompletedSteps([]);
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth form for logged-out users
  if (!user) {
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
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <FormField label="Email">
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </FormField>

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

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={authSubmitting}>
                {authSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile form for authenticated users (this will redirect to /profile via useEffect)
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold text-foreground">AI Visibility Profile</h1>
              <p className="text-xs text-muted-foreground">Client Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <FormProgress currentStep={currentStep} completedSteps={completedSteps} />

        <div className="mt-8">
          {currentStep === 'entity' && <EntityStep data={formData} onChange={setFormData} errors={errors} />}
          {currentStep === 'services' && (
            formData.vertical === 'legal' ? (
              <LegalPracticeAreasStep 
                practiceAreas={formData.practice_areas || []} 
                onChange={(pa: PracticeArea[]) => setFormData({ ...formData, practice_areas: pa })} 
              />
            ) : (
              <ServicesStep services={formData.services || []} onChange={(s) => setFormData({ ...formData, services: s })} />
            )
          )}
          {currentStep === 'products' && <ProductsStep products={formData.products || []} onChange={(p) => setFormData({ ...formData, products: p })} />}
          {currentStep === 'faqs' && <FAQsStep faqs={formData.faqs || []} onChange={(f) => setFormData({ ...formData, faqs: f })} />}
          {currentStep === 'articles' && <ArticlesStep articles={formData.articles || []} onChange={(a) => setFormData({ ...formData, articles: a })} />}
          {currentStep === 'reviews' && <ReviewsStep reviews={formData.reviews || []} onChange={(r) => setFormData({ ...formData, reviews: r })} />}
          {currentStep === 'locations' && <LocationsStep locations={formData.locations || []} onChange={(l) => setFormData({ ...formData, locations: l })} />}
          {currentStep === 'team' && <TeamStep teamMembers={formData.team_members || []} onChange={(t) => setFormData({ ...formData, team_members: t })} />}
          {currentStep === 'awards' && <AwardsStep awards={formData.awards || []} onChange={(a) => setFormData({ ...formData, awards: a })} />}
          {currentStep === 'media' && <MediaStep mediaMentions={formData.media_mentions || []} onChange={(m) => setFormData({ ...formData, media_mentions: m })} />}
          {currentStep === 'cases' && <CasesStep caseStudies={formData.case_studies || []} onChange={(c) => setFormData({ ...formData, case_studies: c })} />}
          {currentStep === 'review' && <ReviewStep data={formData} />}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          {currentStep === 'review' ? (
            <Button variant="hero" size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Send className="w-4 h-4 mr-2" />Submit Profile</>}
            </Button>
          ) : (
            <Button variant="default" onClick={goNext}>Next<ArrowRight className="w-4 h-4 ml-2" /></Button>
          )}
        </div>
      </main>
    </div>
  );
}
