import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientProfile, FormStep } from '@/types/profile';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { EntityStep } from '@/components/steps/EntityStep';
import { CredentialsStep } from '@/components/steps/CredentialsStep';
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
import { Send, Sparkles, LogOut, Loader2, Save, Menu, X } from 'lucide-react';

const steps: FormStep[] = ['entity', 'credentials', 'services', 'products', 'faqs', 'articles', 'reviews', 'locations', 'team', 'awards', 'media', 'cases', 'review'];

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('entity');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<ClientProfile>>({
    services: [], products: [], faqs: [], articles: [], reviews: [],
    locations: [], team_members: [], awards: [], media_mentions: [], case_studies: [],
    certifications: [], accreditations: [], insurance_accepted: [],
    vertical: 'general',
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const validateEntity = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.entity_name?.trim()) newErrors.entity_name = 'Entity name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepClick = (step: FormStep) => {
    // Mark current step as completed if it has data
    const stepDataMap: Record<string, any> = {
      entity: formData.entity_name?.trim(),
      credentials: (formData.certifications?.length || 0) > 0 || 
                   (formData.accreditations?.length || 0) > 0 || 
                   (formData.insurance_accepted?.length || 0) > 0,
      services: formData.services,
      products: formData.products,
      faqs: formData.faqs,
      articles: formData.articles,
      reviews: formData.reviews,
      locations: formData.locations,
      team: formData.team_members,
      awards: formData.awards,
      media: formData.media_mentions,
      cases: formData.case_studies,
    };

    if (currentStep !== 'review') {
      const hasData = currentStep === 'entity' || currentStep === 'credentials' 
        ? stepDataMap[currentStep]
        : stepDataMap[currentStep]?.length > 0;
      
      if (hasData && !completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
    }
    
    setCurrentStep(step);
    setSidebarOpen(false);
  };

  const handleSaveSection = () => {
    if (currentStep === 'entity' && !validateEntity()) return;
    
    setSaving(true);
    
    // Mark current step as completed
    if (!completedSteps.includes(currentStep) && currentStep !== 'review') {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    setTimeout(() => {
      setSaving(false);
      toast({ title: 'Section saved', description: 'Your changes have been saved locally.' });
    }, 300);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    const agencyUserId = localStorage.getItem('agency_user_id');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!agencyUserId || !uuidRegex.test(agencyUserId)) {
      localStorage.removeItem('agency_user_id');
      toast({ title: 'Error', description: 'Invalid session. Please use your agency link again.', variant: 'destructive' });
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
      agency_user_id: agencyUserId,
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
      // New fields
      vertical: formData.vertical || 'general',
      certifications: formData.certifications || [],
      accreditations: formData.accreditations || [],
      insurance_accepted: formData.insurance_accepted || [],
      gmb_url: formData.gmb_url || null,
      apple_maps_url: formData.apple_maps_url || null,
      yelp_url: formData.yelp_url || null,
      bbb_url: formData.bbb_url || null,
      tiktok_url: formData.tiktok_url || null,
      pinterest_url: formData.pinterest_url || null,
      legal_profile: formData.legal_profile || null,
      medical_profile: formData.medical_profile || null,
    };

    const { error } = await supabase.from('business_entities').insert(profilePayload as any);

    if (error) {
      setSubmitting(false);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    try {
      const { error: emailError } = await supabase.functions.invoke('send-profile-email', {
        body: profilePayload,
      });
      if (emailError) console.error('Email notification failed:', emailError);
    } catch (emailErr) {
      console.error('Email notification error:', emailErr);
    }

    setSubmitting(false);
    toast({ title: 'Success!', description: 'Your AI Visibility Profile has been saved.' });
    setFormData({ 
      services: [], products: [], faqs: [], articles: [], reviews: [], 
      locations: [], team_members: [], awards: [], media_mentions: [], case_studies: [],
      certifications: [], accreditations: [], insurance_accepted: [],
      vertical: 'general',
    });
    setCurrentStep('entity');
    setCompletedSteps([]);
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const stepLabels: Record<FormStep, string> = {
    entity: 'Organization',
    credentials: 'Credentials',
    services: 'Services',
    products: 'Products',
    faqs: 'FAQs',
    articles: 'Articles',
    reviews: 'Reviews',
    locations: 'Locations',
    team: 'Team',
    awards: 'Awards',
    media: 'Media',
    cases: 'Case Studies',
    review: 'Review & Submit',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          top-[73px] lg:top-0
        `}>
          <ProfileSidebar 
            currentStep={currentStep} 
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Mobile current step indicator */}
            <div className="lg:hidden mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{stepLabels[currentStep]}</span>
              <span>•</span>
              <span>{steps.indexOf(currentStep) + 1} of {steps.length}</span>
            </div>

            <div className="space-y-6">
              {currentStep === 'entity' && <EntityStep data={formData} onChange={setFormData} errors={errors} />}
              {currentStep === 'credentials' && <CredentialsStep data={formData} onChange={setFormData} />}
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

            {/* Action buttons */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              {currentStep !== 'review' ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Save your progress before moving to another section
                  </p>
                  <Button onClick={handleSaveSection} disabled={saving}>
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Section</>}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Review your profile and submit when ready
                  </p>
                  <Button variant="hero" size="lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Send className="w-4 h-4 mr-2" />Submit Profile</>}
                  </Button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
