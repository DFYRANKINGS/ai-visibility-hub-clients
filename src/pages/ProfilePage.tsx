import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientProfile, FormStep, PracticeArea, MedicalSpecialty } from '@/types/profile';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { EntityStep } from '@/components/steps/EntityStep';
import { CredentialsStep } from '@/components/steps/CredentialsStep';
import { ServicesStep } from '@/components/steps/ServicesStep';
import { LegalPracticeAreasStep } from '@/components/steps/LegalPracticeAreasStep';
import { MedicalSpecialtiesStep } from '@/components/steps/MedicalSpecialtiesStep';
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
import { Send, Sparkles, LogOut, Loader2, Save, Menu, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DEFAULT_AGENCY_USER_ID } from '@/lib/constants';

const steps: FormStep[] = ['entity', 'credentials', 'services', 'products', 'faqs', 'articles', 'reviews', 'locations', 'team', 'awards', 'media', 'cases', 'review'];

const profileDraftKey = (userId: string) => `aivp:draft:${userId}`;

const loadProfileDraft = (userId: string): Partial<ClientProfile> | null => {
  try {
    const raw = localStorage.getItem(profileDraftKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __savedAt, ...draft } = parsed;
    return draft as Partial<ClientProfile>;
  } catch {
    return null;
  }
};

const saveProfileDraft = (userId: string, data: Partial<ClientProfile>) => {
  try {
    localStorage.setItem(
      profileDraftKey(userId),
      JSON.stringify({ ...data, __savedAt: Date.now() })
    );
  } catch {
    // ignore storage errors
  }
};

const isMissingColumnError = (message?: string) => {
  const m = (message || '').toLowerCase();
  return m.includes('column') && (m.includes('does not exist') || m.includes('schema cache'));
};

const downloadProfileAsXlsx = (data: Partial<ClientProfile>) => {
  const entityName = data.entity_name?.trim() || 'Profile';
  const fileName = `${entityName} Master Profile.xlsx`;

  const workbook = XLSX.utils.book_new();

  // Organization Info sheet
  const orgData = [
    ['Entity Name', data.entity_name || ''],
    ['Legal Name', data.legal_name || ''],
    ['Business Vertical', data.vertical || ''],
    ['Main Website URL', data.main_website_url || ''],
    ['Short Description', data.short_description || ''],
    ['Long Description', data.long_description || ''],
    ['Hours', data.hours || ''],
    ['Founding Year', data.founding_year || ''],
    ['Team Size', data.team_size || ''],
    ['Phone', data.phone || ''],
    ['Email', data.email || ''],
    ['Address Street', data.address_street || ''],
    ['Address City', data.address_city || ''],
    ['Address State', data.address_state || ''],
    ['Address Postal Code', data.address_postal_code || ''],
  ];
  const orgSheet = XLSX.utils.aoa_to_sheet(orgData);
  XLSX.utils.book_append_sheet(workbook, orgSheet, 'Organization');

  // Helper to create sheet from array data
  const addArraySheet = (sheetName: string, headers: string[], items: any[], mapper: (item: any) => any[]) => {
    if (items && items.length > 0) {
      const sheetData = [headers, ...items.map(mapper)];
      const sheet = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }
  };

  // Services
  addArraySheet('Services', ['Name', 'Description', 'Price'], data.services || [], 
    (s) => [s.name || '', s.description || '', s.price || '']);

  // Products
  addArraySheet('Products', ['Name', 'Description', 'Price', 'URL'], data.products || [],
    (p) => [p.name || '', p.description || '', p.price || '', p.url || '']);

  // FAQs
  addArraySheet('FAQs', ['Question', 'Answer'], data.faqs || [],
    (f) => [f.question || '', f.answer || '']);

  // Articles
  addArraySheet('Articles', ['Title', 'URL', 'Date Published', 'Description'], data.articles || [],
    (a) => [a.title || '', a.url || '', a.date_published || '', a.description || '']);

  // Reviews
  addArraySheet('Reviews', ['Author', 'Rating', 'Review Text', 'Date', 'Source'], data.reviews || [],
    (r) => [r.author || '', r.rating || '', r.review_text || '', r.date || '', r.source || '']);

  // Locations
  addArraySheet('Locations', ['Name', 'Street', 'City', 'State', 'Postal Code', 'Phone'], data.locations || [],
    (l) => [l.name || '', l.street || '', l.city || '', l.state || '', l.postal_code || '', l.phone || '']);

  // Team Members
  addArraySheet('Team Members', ['Name', 'Title', 'Bio', 'Email', 'Phone'], data.team_members || [],
    (t) => [t.name || '', t.title || '', t.bio || '', t.email || '', t.phone || '']);

  // Awards
  addArraySheet('Awards', ['Name', 'Year', 'Issuer', 'Description'], data.awards || [],
    (a) => [a.name || '', a.year || '', a.issuer || '', a.description || '']);

  // Media Mentions
  addArraySheet('Media Mentions', ['Title', 'Publication', 'URL', 'Date'], data.media_mentions || [],
    (m) => [m.title || '', m.publication || '', m.url || '', m.date || '']);

  // Case Studies
  addArraySheet('Case Studies', ['Title', 'Description', 'Outcome', 'URL'], data.case_studies || [],
    (c) => [c.title || '', c.description || '', c.outcome || '', c.url || '']);

  // Certifications
  addArraySheet('Certifications', ['Name', 'Issuer', 'Year', 'URL'], data.certifications || [],
    (c) => [c.name || '', c.issuer || '', c.year || '', c.url || '']);

  // Accreditations
  addArraySheet('Accreditations', ['Name', 'Issuer', 'Year', 'URL'], data.accreditations || [],
    (a) => [a.name || '', a.issuer || '', a.year || '', a.url || '']);

  // Legal Practice Areas (top-level)
  if (data.practice_areas && data.practice_areas.length > 0) {
    addArraySheet('Practice Areas', ['Name', 'Case Types', 'Jurisdiction', 'Service Areas', 'Description'], data.practice_areas,
      (p) => [p.name || '', p.case_types || '', p.jurisdiction || '', p.service_areas || '', p.description || '']);
  }

  // Medical Specialties (top-level)
  if (data.medical_specialties && data.medical_specialties.length > 0) {
    addArraySheet('Medical Specialties', ['Name', 'Conditions Treated', 'Procedures Offered', 'Patient Population', 'Description'], data.medical_specialties,
      (s) => [s.name || '', s.conditions_treated || '', s.procedures_offered || '', s.patient_population || '', s.description || '']);
  }

  // Same As (Social Links)
  if (data.same_as && data.same_as.length > 0) {
    const sameAsData = [['Social Links'], ...data.same_as.map((url) => [url])];
    const sameAsSheet = XLSX.utils.aoa_to_sheet(sameAsData);
    XLSX.utils.book_append_sheet(workbook, sameAsSheet, 'Social Links');
  }

  XLSX.writeFile(workbook, fileName);
};

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('entity');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track if user has made any edits

  const [formData, setFormDataInternal] = useState<Partial<ClientProfile>>({
    services: [], products: [], faqs: [], articles: [], reviews: [],
    locations: [], team_members: [], awards: [], media_mentions: [], case_studies: [],
    certifications: [], accreditations: [], insurance_accepted: [],
    practice_areas: [], medical_specialties: [],
    vertical: 'general',
  });

  // Wrapper that marks form as dirty when user makes changes
  const updateFormData = (data: Partial<ClientProfile> | ((prev: Partial<ClientProfile>) => Partial<ClientProfile>)) => {
    setIsDirty(true);
    if (typeof data === 'function') {
      setFormDataInternal(data);
    } else {
      setFormDataInternal(prev => ({ ...prev, ...data }));
    }
  };

  // For internal use (loading from DB/draft) - doesn't mark as dirty
  const setFormData = setFormDataInternal;

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  // Load existing profile data when user logs in
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const draft = loadProfileDraft(user.id);

      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('client_profile')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        // If database load fails, still restore draft so the user doesn't lose work.
        if (draft) {
          setFormData((prev) => ({ ...prev, ...draft }));
          toast({
            title: 'Loaded from local draft',
            description: 'We could not load your profile from the database, so we restored your latest draft from this browser.',
          });
        }
        // Suppress error toast on initial load - user hasn't edited anything yet
        setLoadingProfile(false);
        return;
      }

      if (data) {
        setProfileId(data.id);

        const fromDb: Partial<ClientProfile> = {
          entity_name: data.entity_name,
          legal_name: (data as any).legal_name || undefined,
          vertical: (data as any).vertical || undefined,

          main_website_url: data.main_website_url || undefined,
          short_description: data.short_description || undefined,
          long_description: data.long_description || undefined,
          hours: data.hours || undefined,
          founding_year: data.founding_year || undefined,
          team_size: data.team_size || undefined,

          address_street: data.address_street || undefined,
          address_city: data.address_city || undefined,
          address_state: data.address_state || undefined,
          address_postal_code: data.address_postal_code || undefined,

          phone: data.phone || undefined,
          email: data.email || undefined,

          same_as: (data.same_as as string[]) || [],
          services: (data.services as any[]) || [],
          products: (data.products as any[]) || [],
          faqs: (data.faqs as any[]) || [],
          articles: (data.articles as any[]) || [],
          reviews: (data.reviews as any[]) || [],
          locations: (data.locations as any[]) || [],
          team_members: (data.team_members as any[]) || [],
          awards: (data.awards as any[]) || [],
          media_mentions: (data.media_mentions as any[]) || [],
          case_studies: (data.case_studies as any[]) || [],

          // Credentials + vertical-specific
          certifications: ((data as any).certifications as any[]) || [],
          accreditations: ((data as any).accreditations as any[]) || [],
          insurance_accepted: ((data as any).insurance_accepted as any[]) || [],
          practice_areas: ((data as any).practice_areas as any[]) || [],
          medical_specialties: ((data as any).medical_specialties as any[]) || [],
          legal_profile: ((data as any).legal_profile as any) || undefined,
          medical_profile: ((data as any).medical_profile as any) || undefined,
        };

        // Merge: defaults -> draft -> db (db wins where it has data)
        setFormData((prev) => ({ ...prev, ...(draft ?? {}), ...fromDb }));

        // Mark steps with data as completed
        const stepsWithData: FormStep[] = [];
        if (data.entity_name) stepsWithData.push('entity');
        if (((fromDb.certifications as any[])?.length || 0) > 0 || ((fromDb.accreditations as any[])?.length || 0) > 0 || ((fromDb.insurance_accepted as any[])?.length || 0) > 0) {
          stepsWithData.push('credentials');
        }
        if ((data.services as any[])?.length > 0 || ((data as any).practice_areas as any[])?.length > 0 || ((data as any).medical_specialties as any[])?.length > 0) stepsWithData.push('services');
        if ((data.products as any[])?.length > 0) stepsWithData.push('products');
        if ((data.faqs as any[])?.length > 0) stepsWithData.push('faqs');
        if ((data.articles as any[])?.length > 0) stepsWithData.push('articles');
        if ((data.reviews as any[])?.length > 0) stepsWithData.push('reviews');
        if ((data.locations as any[])?.length > 0) stepsWithData.push('locations');
        if ((data.team_members as any[])?.length > 0) stepsWithData.push('team');
        if ((data.awards as any[])?.length > 0) stepsWithData.push('awards');
        if ((data.media_mentions as any[])?.length > 0) stepsWithData.push('media');
        if ((data.case_studies as any[])?.length > 0) stepsWithData.push('cases');
        setCompletedSteps(stepsWithData);
      } else if (draft) {
        // No database row yet, but we have a draft.
        setFormData((prev) => ({ ...prev, ...draft }));
      }

      setLoadingProfile(false);
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

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

  const handleSaveSection = async () => {
    if (!user) return;
    // Only save if the user has made edits
    if (!isDirty) {
      toast({ title: 'No changes to save', description: 'Make changes before saving.' });
      return;
    }
    if (currentStep === 'entity' && !validateEntity()) return;

    setSaving(true);

    // Always save a draft in this browser so sign-out/in doesn't lose work.
    saveProfileDraft(user.id, formData);

    const profilePayload: any = {
      ...(profileId ? { id: profileId } : {}),
      owner_user_id: user.id,
      agency_user_id: DEFAULT_AGENCY_USER_ID,
      entity_name: formData.entity_name || 'Untitled',
      legal_name: (formData as any).legal_name || null,
      vertical: (formData as any).vertical || 'general',

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

      // Credentials + vertical-specific
      certifications: (formData as any).certifications || [],
      accreditations: (formData as any).accreditations || [],
      insurance_accepted: (formData as any).insurance_accepted || [],
      practice_areas: (formData as any).practice_areas || [],
      medical_specialties: (formData as any).medical_specialties || [],
      legal_profile: (formData as any).legal_profile || {},
      medical_profile: (formData as any).medical_profile || {},
    };

    const { data: saved, error } = await supabase
      .from('client_profile')
      .upsert(profilePayload)
      .select('id')
      .single();

    console.log('client_profile saveSection result', {
      ok: !error,
      id: saved?.id,
      message: error?.message,
      code: (error as any)?.code,
    });

    setSaving(false);

    if (error) {
      toast({
        title: 'Not saved to database',
        description: `${error.message} (Your draft is saved locally in this browser.)`,
        variant: 'destructive',
      });
      return;
    }

    if (saved?.id && !profileId) setProfileId(saved.id);

    // Mark current step as completed
    if (!completedSteps.includes(currentStep) && currentStep !== 'review') {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    toast({ title: 'Section saved', description: 'Saved to the database.' });
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Only allow submit if user has made edits
    if (!isDirty) {
      toast({ title: 'No changes to submit', description: 'Make changes before submitting.' });
      return;
    }

    if (!formData.entity_name?.trim()) {
      toast({ title: 'Error', description: 'Entity name is required', variant: 'destructive' });
      setCurrentStep('entity');
      return;
    }

    setSubmitting(true);

    // Keep a local draft even when submitting.
    saveProfileDraft(user.id, formData);

    const profilePayload: any = {
      ...(profileId ? { id: profileId } : {}),
      owner_user_id: user.id,
      agency_user_id: DEFAULT_AGENCY_USER_ID,
      entity_name: formData.entity_name,
      legal_name: (formData as any).legal_name || null,
      vertical: (formData as any).vertical || 'general',

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

      certifications: (formData as any).certifications || [],
      accreditations: (formData as any).accreditations || [],
      insurance_accepted: (formData as any).insurance_accepted || [],
      practice_areas: (formData as any).practice_areas || [],
      medical_specialties: (formData as any).medical_specialties || [],
      legal_profile: (formData as any).legal_profile || {},
      medical_profile: (formData as any).medical_profile || {},
    };

    const { data: saved, error } = await supabase
      .from('client_profile')
      .upsert(profilePayload)
      .select('id')
      .single();

    console.log('client_profile submit result', {
      ok: !error,
      id: saved?.id,
      message: error?.message,
      code: (error as any)?.code,
    });

    if (error) {
      setSubmitting(false);
      toast({
        title: 'Not submitted',
        description: `${error.message} (Your draft is saved locally in this browser.)`,
        variant: 'destructive',
      });
      return;
    }

    if (saved?.id && !profileId) setProfileId(saved.id);

    try {
      const { error: emailError } = await supabase.functions.invoke('send-profile-email', {
        body: { ...profilePayload, user_email: user.email },
      });
      if (emailError) console.log('Email notification failed', { message: emailError.message });
    } catch (emailErr) {
      console.log('Email notification error', emailErr);
    }

    setSubmitting(false);
    toast({ title: 'Success!', description: 'Your AI Visibility Profile has been submitted.' });
  };

  if (authLoading || loadingProfile || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const stepLabels: Record<FormStep, string> = {
    entity: 'Organization',
    credentials: 'Credentials',
    services: formData.vertical === 'legal' ? 'Practice Areas' : 'Services',
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
          </div>
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
            vertical={formData.vertical}
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
              {currentStep === 'entity' && <EntityStep data={formData} onChange={updateFormData} errors={errors} />}
              {currentStep === 'credentials' && <CredentialsStep data={formData} onChange={updateFormData} />}
              {currentStep === 'services' && (
                formData.vertical === 'legal' ? (
                  <LegalPracticeAreasStep 
                    practiceAreas={formData.practice_areas || []} 
                    onChange={(pa: PracticeArea[]) => updateFormData({ practice_areas: pa })} 
                  />
                ) : formData.vertical === 'medical' ? (
                  <MedicalSpecialtiesStep 
                    medicalSpecialties={formData.medical_specialties || []} 
                    onChange={(ms: MedicalSpecialty[]) => updateFormData({ medical_specialties: ms })} 
                  />
                ) : (
                  <ServicesStep services={formData.services || []} onChange={(s) => updateFormData({ services: s })} />
                )
              )}
              {currentStep === 'products' && <ProductsStep products={formData.products || []} onChange={(p) => updateFormData({ products: p })} />}
              {currentStep === 'faqs' && <FAQsStep faqs={formData.faqs || []} onChange={(f) => updateFormData({ faqs: f })} />}
              {currentStep === 'articles' && <ArticlesStep articles={formData.articles || []} onChange={(a) => updateFormData({ articles: a })} />}
              {currentStep === 'reviews' && <ReviewsStep reviews={formData.reviews || []} onChange={(r) => updateFormData({ reviews: r })} />}
              {currentStep === 'locations' && <LocationsStep locations={formData.locations || []} onChange={(l) => updateFormData({ locations: l })} />}
              {currentStep === 'team' && <TeamStep teamMembers={formData.team_members || []} onChange={(t) => updateFormData({ team_members: t })} />}
              {currentStep === 'awards' && <AwardsStep awards={formData.awards || []} onChange={(a) => updateFormData({ awards: a })} />}
              {currentStep === 'media' && <MediaStep mediaMentions={formData.media_mentions || []} onChange={(m) => updateFormData({ media_mentions: m })} />}
              {currentStep === 'cases' && <CasesStep caseStudies={formData.case_studies || []} onChange={(c) => updateFormData({ case_studies: c })} />}
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
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="lg" onClick={() => downloadProfileAsXlsx(formData)}>
                      <Download className="w-4 h-4 mr-2" />Download XLSX
                    </Button>
                    <Button variant="hero" size="lg" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Send className="w-4 h-4 mr-2" />Submit Profile</>}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
