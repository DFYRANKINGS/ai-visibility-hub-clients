import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientProfile, FormStep, PracticeArea, MedicalSpecialty, HelpArticle } from '@/types/profile';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { EntityStep } from '@/components/steps/EntityStep';
import { EntityLinkingStep } from '@/components/steps/EntityLinkingStep';
import { CredentialsStep } from '@/components/steps/CredentialsStep';
import { ServicesStep } from '@/components/steps/ServicesStep';
import { LegalPracticeAreasStep } from '@/components/steps/LegalPracticeAreasStep';
import { MedicalSpecialtiesStep } from '@/components/steps/MedicalSpecialtiesStep';
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
import { Send, Sparkles, LogOut, Loader2, Save, Menu, X, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { safeUpsertClientProfile } from '@/lib/clientProfileUpsert';
import { HARDCODED_AGENCY_USER_ID } from '@/lib/constants';
import { parseXlsxToProfile, readFileAsArrayBuffer } from '@/lib/xlsxImport';


const steps: FormStep[] = ['entity', 'team', 'entity_linking', 'credentials', 'services', 'faqs', 'help_articles', 'reviews', 'awards', 'media', 'cases', 'review'];

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

const downloadProfileAsXlsx = (data: Partial<ClientProfile>) => {
  const businessName = data.business_name?.trim() || 'Profile';
  const fileName = `${businessName} Master Profile.xlsx`;

  const workbook = XLSX.utils.book_new();

  // Organization Info sheet
  const orgData = [
    ['Business Name', data.business_name || ''],
    ['Alternate Name', data.alternate_name || ''],
    ['Business Vertical', data.vertical || ''],
    ['Business URL', data.business_url || ''],
    ['Short Description', data.short_description || ''],
    ['Long Description', data.long_description || ''],
    ['Team Size', data.team_size || ''],
    ['Phone', data.phone || ''],
    ['Email', data.email || ''],
  ];
  const orgSheet = XLSX.utils.aoa_to_sheet(orgData);
  XLSX.utils.book_append_sheet(workbook, orgSheet, 'Organization');

  const addArraySheet = (sheetName: string, headers: string[], items: any[], mapper: (item: any) => any[]) => {
    if (items && items.length > 0) {
      const sheetData = [headers, ...items.map(mapper)];
      const sheet = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }
  };

  addArraySheet('Services', ['Name', 'Category', 'Description'], data.services || [], 
    (s) => [s.title || s.name || '', s.category || '', s.description || '']);

  addArraySheet('FAQs', ['Question', 'Answer'], data.faqs || [],
    (f) => [f.question || '', f.answer || '']);

  addArraySheet('Help Articles', ['Title', 'URL', 'Date Published', 'Content'], data.help_articles || [],
    (a) => [a.title || '', a.url || '', a.published_date || '', a.article_content || '']);

  addArraySheet('Reviews', ['Customer', 'Rating', 'Review', 'Date'], data.reviews || [],
    (r) => [r.customer_name || '', r.rating || '', r.review_body || '', r.date || '']);

  addArraySheet('Locations', ['Name', 'Street', 'City', 'State', 'Postal Code', 'Phone', 'Hours'], data.locations || [],
    (l) => [l.location_name || l.name || '', l.street || '', l.city || '', l.state || '', l.postal_code || '', l.phone || '', l.hours || '']);

  addArraySheet('Team Members', ['Name', 'Role', 'Bio'], data.team_members || [],
    (t) => [t.member_name || t.name || '', t.role || t.title || '', t.bio || '']);

  addArraySheet('Awards', ['Name', 'Issuer', 'Date'], data.awards || [],
    (a) => [a.name || '', a.issuer || '', a.date_awarded || '']);

  addArraySheet('Media Mentions', ['Title', 'Publication', 'URL', 'Date'], data.media_mentions || [],
    (m) => [m.title || '', m.publications || '', m.url || '', m.date || '']);

  addArraySheet('Case Studies', ['Title', 'Summary', 'Outcome'], data.case_studies || [],
    (c) => [c.title || '', c.summary || '', c.outcome_metrics || '']);

  addArraySheet('Certifications', ['Name', 'Issuer', 'Date'], data.certifications || [],
    (c) => [c.name || '', c.issuing_body || '', c.date_obtained || '']);

  addArraySheet('Accreditations', ['Name', 'Issuer', 'Date'], data.accreditations || [],
    (a) => [a.name || '', a.accrediting_body || '', a.date_obtained || '']);

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

  XLSX.writeFile(workbook, fileName);
};

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState<FormStep>('entity');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track if user has made any edits
  const [importing, setImporting] = useState(false);

  const [formData, setFormDataInternal] = useState<Partial<ClientProfile>>(() => ({
    entity_id: crypto.randomUUID(),
    agency_user_id: HARDCODED_AGENCY_USER_ID,
    services: [], faqs: [], help_articles: [], reviews: [],
    locations: [], team_members: [], awards: [], media_mentions: [], case_studies: [],
    certifications: [], accreditations: [],
    practice_areas: [], medical_specialties: [],
    vertical: 'general',
  }));

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
          entity_id: (data as any).entity_id,
          owner_user_id: (data as any).owner_user_id,
          agency_user_id: (data as any).agency_user_id ?? HARDCODED_AGENCY_USER_ID,

          business_name: (data as any).business_name,
          alternate_name: (data as any).alternate_name || undefined,
          vertical: (data as any).vertical || undefined,

          business_url: (data as any).business_url || undefined,
          short_description: data.short_description || undefined,
          long_description: data.long_description || undefined,
          year_established: (data as any).year_established || undefined,
          team_size: (data as any).team_size || undefined,

          phone: data.phone || undefined,
          email: data.email || undefined,

          services: (data.services as any[]) || [],
          faqs: (data.faqs as any[]) || [],
          help_articles: ((data as any).help_articles as any[]) || [],
          reviews: (data.reviews as any[]) || [],
          locations: (data.locations as any[]) || [],
          team_members: (data.team_members as any[]) || [],
          awards: (data.awards as any[]) || [],
          media_mentions: (data.media_mentions as any[]) || [],
          case_studies: (data.case_studies as any[]) || [],

          // Credentials + vertical-specific
          certifications: ((data as any).certifications as any[]) || [],
          accreditations: ((data as any).accreditations as any[]) || [],
          practice_areas: ((data as any).practice_areas as any[]) || [],
          medical_specialties: ((data as any).medical_specialties as any[]) || [],
          legal_profile: ((data as any).legal_profile as any) || undefined,
          medical_profile: ((data as any).medical_profile as any) || undefined,
          
          // Entity linking
          google_business_url: (data as any).google_business_url || undefined,
          google_maps_url: (data as any).google_maps_url || undefined,
          yelp_url: (data as any).yelp_url || undefined,
          bbb_url: (data as any).bbb_url || undefined,
          apple_maps_url: (data as any).apple_maps_url || undefined,
          linkedin_url: (data as any).linkedin_url || undefined,
          facebook_url: (data as any).facebook_url || undefined,
          instagram_url: (data as any).instagram_url || undefined,
          youtube_url: (data as any).youtube_url || undefined,
          twitter_url: (data as any).twitter_url || undefined,
          tiktok_url: (data as any).tiktok_url || undefined,
          pinterest_url: (data as any).pinterest_url || undefined,
          other_profiles: ((data as any).other_profiles as any[]) || [],
        };

        // Merge: defaults -> draft -> db (db wins where it has data)
        setFormData((prev) => ({ ...prev, ...(draft ?? {}), ...fromDb }));

        // Mark steps with data as completed
        const stepsWithData: FormStep[] = [];
        if ((data as any).business_name) stepsWithData.push('entity');
        if ((data.team_members as any[])?.length > 0) stepsWithData.push('team');
        const hasEntityLinking = (data as any).google_business_url || (data as any).linkedin_url || ((data as any).other_profiles as any[])?.length > 0;
        if (hasEntityLinking) stepsWithData.push('entity_linking');
        if (((fromDb.certifications as any[])?.length || 0) > 0 || ((fromDb.accreditations as any[])?.length || 0) > 0) {
          stepsWithData.push('credentials');
        }
        if ((data.services as any[])?.length > 0 || ((data as any).practice_areas as any[])?.length > 0 || ((data as any).medical_specialties as any[])?.length > 0) stepsWithData.push('services');
        if ((data.faqs as any[])?.length > 0) stepsWithData.push('faqs');
        if (((data as any).help_articles as any[])?.length > 0) stepsWithData.push('help_articles');
        if ((data.reviews as any[])?.length > 0) stepsWithData.push('reviews');
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
    if (!formData.business_name?.trim()) newErrors.business_name = 'Business name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildClientProfileUpsertPayload = () => {
    const businessName = (formData.business_name ?? '').trim() || 'Untitled';

    // Required canonical columns
    const entityId = formData.entity_id ?? crypto.randomUUID();

    return {
      ...(profileId ? { id: profileId } : {}),
      entity_id: entityId,
      owner_user_id: user!.id,
      agency_user_id: HARDCODED_AGENCY_USER_ID,
      business_name: businessName,
      alternate_name: formData.alternate_name || null,

      business_url: formData.business_url || null,
      short_description: formData.short_description || null,
      long_description: formData.long_description || null,
      year_established: formData.year_established || null,
      team_size: formData.team_size || null,

      phone: formData.phone || null,
      email: formData.email || null,

      services: formData.services || [],
      faqs: formData.faqs || [],
      help_articles: formData.help_articles || [],
      reviews: formData.reviews || [],
      locations: formData.locations || [],
      team_members: formData.team_members || [],
      awards: formData.awards || [],
      media_mentions: formData.media_mentions || [],
      case_studies: formData.case_studies || [],
      
      // Entity linking - individual social URLs are handled by buildClientProfilePayload filtering
      other_profiles: formData.other_profiles || [],
    };
  };

  const handleStepClick = (step: FormStep) => {
    // Mark current step as completed if it has data
    const stepDataMap: Record<string, any> = {
      entity: formData.business_name?.trim(),
      team: formData.team_members,
      entity_linking: formData.google_business_url || formData.linkedin_url || (formData.other_profiles?.length || 0) > 0,
      credentials: (formData.certifications?.length || 0) > 0 || 
                   (formData.accreditations?.length || 0) > 0,
      services: formData.services,
      faqs: formData.faqs,
      help_articles: formData.help_articles,
      reviews: formData.reviews,
      awards: formData.awards,
      media: formData.media_mentions,
      cases: formData.case_studies,
    };

    if (currentStep !== 'review') {
      const hasData = currentStep === 'entity' || currentStep === 'credentials' || currentStep === 'entity_linking'
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

    const profilePayload = buildClientProfileUpsertPayload();

    const result = await safeUpsertClientProfile(profilePayload);

    setSaving(false);

    if (result.error) {
      toast({
        title: 'Not saved to database',
        description: `${result.error.message} (Your draft is saved locally in this browser.)`,
        variant: 'destructive',
      });
      return;
    }

    if (result.id && !profileId) setProfileId(result.id);

    // Mark current step as completed
    if (!completedSteps.includes(currentStep) && currentStep !== 'review') {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    toast({ title: 'Section saved', description: 'Saved to the database.' });
  };

  // XLSX Import handler
  const handleXlsxImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    event.target.value = '';

    setImporting(true);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const imported = parseXlsxToProfile(buffer, formData);
      
      // Merge imported data into form state
      setFormDataInternal(prev => ({ ...prev, ...imported }));
      setIsDirty(true);
      
      toast({ 
        title: 'Import successful', 
        description: 'XLSX data has been imported. Review and save to persist changes.' 
      });
    } catch (err) {
      console.error('XLSX import error:', err);
      toast({ 
        title: 'Import failed', 
        description: 'Could not parse the XLSX file. Please check the format.', 
        variant: 'destructive' 
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Only allow submit if user has made edits
    if (!isDirty) {
      toast({ title: 'No changes to submit', description: 'Make changes before submitting.' });
      return;
    }

    if (!formData.business_name?.trim()) {
      toast({ title: 'Error', description: 'Business name is required', variant: 'destructive' });
      setCurrentStep('entity');
      return;
    }

    setSubmitting(true);

    // Keep a local draft even when submitting.
    saveProfileDraft(user.id, formData);

    const profilePayload = buildClientProfileUpsertPayload();

    const result = await safeUpsertClientProfile(profilePayload);

    if (result.error) {
      setSubmitting(false);
      toast({
        title: 'Not submitted',
        description: `${result.error.message} (Your draft is saved locally in this browser.)`,
        variant: 'destructive',
      });
      return;
    }

    if (result.id && !profileId) setProfileId(result.id);

    try {
      const { error: emailError } = await supabase.functions.invoke('send-profile-email', {
        body: { ...formData, user_email: user.email },
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
    team: formData.vertical === 'legal' ? 'Lawyers' : formData.vertical === 'medical' ? 'Healthcare Providers' : 'Associates',
    entity_linking: 'Entity Linking',
    credentials: 'Credentials',
    services: formData.vertical === 'legal' ? 'Practice Areas' : formData.vertical === 'medical' ? 'Specialties' : 'Services',
    faqs: 'FAQs',
    help_articles: 'Help Articles',
    reviews: 'Reviews',
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
              {currentStep === 'team' && <TeamStep teamMembers={formData.team_members || []} onChange={(t) => updateFormData({ team_members: t })} vertical={formData.vertical} />}
              {currentStep === 'entity_linking' && <EntityLinkingStep data={formData} onChange={updateFormData} />}
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
              {currentStep === 'faqs' && <FAQsStep faqs={formData.faqs || []} onChange={(f) => updateFormData({ faqs: f })} />}
              {currentStep === 'help_articles' && <ArticlesStep articles={formData.help_articles || []} onChange={(a) => updateFormData({ help_articles: a })} />}
              {currentStep === 'reviews' && <ReviewsStep reviews={formData.reviews || []} onChange={(r) => updateFormData({ reviews: r })} />}
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
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleXlsxImport}
                        className="hidden"
                        disabled={importing}
                      />
                      <Button variant="outline" size="lg" asChild disabled={importing}>
                        <span>
                          {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing...</> : <><Upload className="w-4 h-4 mr-2" />Import XLSX</>}
                        </span>
                      </Button>
                    </label>
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
