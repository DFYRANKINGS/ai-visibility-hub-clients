import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientProfile, FormStep } from '@/types/profile';
import { FormProgress } from '@/components/FormProgress';
import { EntityStep } from '@/components/steps/EntityStep';
import { ServicesStep } from '@/components/steps/ServicesStep';
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
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Send, Sparkles, LogOut, Loader2 } from 'lucide-react';

const steps: FormStep[] = ['entity', 'services', 'products', 'faqs', 'articles', 'reviews', 'locations', 'team', 'awards', 'media', 'cases', 'review'];

export default function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('entity');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<ClientProfile>>({
    services: [], products: [], faqs: [], articles: [], reviews: [],
    locations: [], team_members: [], awards: [], media_mentions: [], case_studies: [],
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

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
    
    // Get the agency owner's ID from localStorage (set during invite link access)
    const agencyOwnerId = localStorage.getItem('agency_owner_id');
    
    // Validate it's a proper UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!agencyOwnerId || !uuidRegex.test(agencyOwnerId)) {
      // Clear invalid data and redirect to re-validate
      localStorage.removeItem('agency_owner_id');
      toast({ title: 'Error', description: 'Invalid session. Please use your agency invite link again.', variant: 'destructive' });
      navigate('/auth');
      return;
    }
    
    if (!formData.entity_name?.trim()) {
      toast({ title: 'Error', description: 'Entity name is required', variant: 'destructive' });
      setCurrentStep('entity');
      return;
    }

    setSubmitting(true);
    
    const profilePayload = {
      owner_user_id: agencyOwnerId,
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

    // Save to database
    const { error } = await supabase.from('client_profile').insert(profilePayload as any);

    if (error) {
      setSubmitting(false);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    // Send email notification via SendPulse
    try {
      const { error: emailError } = await supabase.functions.invoke('send-profile-email', {
        body: profilePayload,
      });
      
      if (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the submission, just log the error
      }
    } catch (emailErr) {
      console.error('Email notification error:', emailErr);
    }

    setSubmitting(false);
    toast({ title: 'Success!', description: 'Your AI Visibility Profile has been saved and sent.' });
    setFormData({ services: [], products: [], faqs: [], articles: [], reviews: [], locations: [], team_members: [], awards: [], media_mentions: [], case_studies: [] });
    setCurrentStep('entity');
    setCompletedSteps([]);
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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
          <Button variant="ghost" size="sm" onClick={() => signOut()}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <FormProgress currentStep={currentStep} completedSteps={completedSteps} />

        <div className="mt-8">
          {currentStep === 'entity' && <EntityStep data={formData} onChange={setFormData} errors={errors} />}
          {currentStep === 'services' && <ServicesStep services={formData.services || []} onChange={(s) => setFormData({ ...formData, services: s })} />}
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
