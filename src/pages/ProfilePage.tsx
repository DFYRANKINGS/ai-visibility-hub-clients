import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientProfile, FormStep, HelpArticle } from '@/types/profile';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { EntityStep } from '@/components/steps/EntityStep';
import { EntityLinkingStep } from '@/components/steps/EntityLinkingStep';
import { CredentialsStep } from '@/components/steps/CredentialsStep';
import { ServicesStep } from '@/components/steps/ServicesStep';
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
import { AGENCY_USER_ID } from '@/lib/constants';
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
  const businessName = data.business_name?.trim();
  const fileName = businessName ? `${businessName} Business AI Visibility Profile.xlsx` : 'Business AI Visibility Profile.xlsx';

  const workbook = XLSX.utils.book_new();

  // Helper to get first location for org sheet
  const primaryLocation = (data.locations && data.locations.length > 0) ? data.locations[0] : null;

  // Sheet 1: Organization (horizontal headers)
  const orgHeaders = [
    'business_name', 'main_website_url', 'logo_url', 'year_established', 'team_size',
    'short_description', 'long_description', 'category', 'google_business_url', 'google_maps_url',
    'apple_maps_url', 'yelp_url', 'bbb_url', 'linkedin_url', 'facebook_url', 'instagram_url',
    'youtube_url', 'twitter_url', 'tiktok_url', 'pinterest_url', 'other_profiles',
    'primary_phone', 'primary_email', 'address_street', 'address_city', 'address_state',
    'address_postal', 'open_hours', 'service_areas'
  ];
  const orgRow = [
    data.business_name || '', data.business_url || '', data.logo_url || '',
    data.year_established || '', data.team_size || '', data.short_description || '',
    data.long_description || '', data.category || '', data.google_business_url || '',
    data.google_maps_url || '', data.apple_maps_url || '', data.yelp_url || '',
    data.bbb_url || '', data.linkedin_url || '', data.facebook_url || '',
    data.instagram_url || '', data.youtube_url || '', data.twitter_url || '',
    data.tiktok_url || '', data.pinterest_url || '',
    (data.other_profiles || []).map((p: any) => `${p.platform || ''}:${p.url || ''}`).join(', '),
    data.phone || '', data.email || '',
    primaryLocation?.street || '', primaryLocation?.city || '', primaryLocation?.state || '',
    primaryLocation?.postal_code || '', primaryLocation?.hours || '', ''
  ];
  const orgSheet = XLSX.utils.aoa_to_sheet([orgHeaders, orgRow]);
  XLSX.utils.book_append_sheet(workbook, orgSheet, 'Organization');

  // Helper to add sheets with headers
  const addSheet = (name: string, headers: string[], rows: any[][]) => {
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  };

  // Sheet 2: Locations
  addSheet('Locations',
    ['location_name', 'phone', 'email', 'address_street', 'address_city', 'address_state', 'address_postal', 'service_areas', 'open_hours', 'gmb_url'],
    (data.locations || []).map((l: any) => [
      l.location_name || l.name || '', l.phone || '', '', l.street || '', l.city || '',
      l.state || '', l.postal_code || '', '', l.hours || '', ''
    ])
  );

  // Sheet 3: Services (expertise_name, description)
  addSheet('Services',
    ['expertise_name', 'description'],
    (data.services || []).map((s: any) => [s.title || s.name || '', s.description || ''])
  );

  // Sheet 4: Team Members
  addSheet('Team Members',
    ['full_name', 'role_title', 'linkedin_url', 'photo_url', 'license_number', 'profile_links', 'certifications', 'areas_of_expertise', 'bio'],
    (data.team_members || []).map((t: any) => [
      t.member_name || t.name || '', t.role || t.title || '', t.linkedin_url || '', t.photo_url || '', t.license_number || '',
      (t.profile_urls || []).map((p: any) => `${p.platform || ''}:${p.url || ''}`).join(', '),
      (t.certifications || []).map((c: any) => c.name || '').join(', '),
      (t.specialties || []).join(', '), t.bio || ''
    ])
  );

  // Sheet 5: FAQs
  addSheet('FAQs',
    ['question', 'answer', 'url'],
    (data.faqs || []).map((f: any) => [f.question || '', f.answer || '', ''])
  );

  // Sheet 10: Help Articles
  addSheet('Help Articles',
    ['article_id', 'title', 'article_type', 'article_content', 'published_date', 'url', 'keywords', 'slug'],
    (data.help_articles || []).map((a: any) => [
      a.article_id || '', a.title || '', a.article_type || '', a.article_content || '',
      a.published_date || '', a.url || '', a.keywords || '', a.slug || ''
    ])
  );

  // Sheet 11: Reviews
  addSheet('Reviews',
    ['review_title', 'date', 'rating', 'review'],
    (data.reviews || []).map((r: any) => [r.review_title || '', r.date || '', r.rating || '', r.review_body || ''])
  );

  // Sheet 12: Case Studies
  addSheet('Case Studies',
    ['title', 'summary', 'outcome'],
    (data.case_studies || []).map((c: any) => [c.title || '', c.summary || '', c.outcome_metrics || ''])
  );

  // Sheet 13: Media Mentions
  addSheet('Media Mentions',
    ['title', 'publication', 'date', 'url'],
    (data.media_mentions || []).map((m: any) => [m.title || '', m.publications || '', m.date || '', m.url || ''])
  );

  // Sheet 14: Awards
  addSheet('Awards',
    ['award_name', 'issuer', 'date', 'url'],
    (data.awards || []).map((a: any) => [a.name || '', a.issuer || '', a.date_awarded || '', a.award_url || ''])
  );

  // Sheet 15: Certifications
  addSheet('Certifications',
    ['certification_name', 'issuer', 'date', 'url'],
    (data.certifications || []).map((c: any) => [c.name || '', c.issuing_body || '', c.date_obtained || '', ''])
  );

  // Sheet 16: Accreditations
  addSheet('Accreditations',
    ['accreditation_name', 'organization', 'date', 'url'],
    (data.accreditations || []).map((a: any) => [a.name || '', a.accrediting_body || '', a.date_obtained || '', ''])
  );

  XLSX.writeFile(workbook, fileName);
};

export default function ProfilePage() {
  const agencyUserId = AGENCY_USER_ID;

  if (!agencyUserId) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <section className="w-full max-w-lg bg-card rounded-2xl shadow-card p-6">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Configuration required</h1>
          <p className="mt-2 text-muted-foreground">
            This app requires <code className="font-mono">VITE_AGENCY_USER_ID</code> to be set in the environment.
            Add it and redeploy (then refresh).
          </p>
        </section>
      </main>
    );
  }

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
    agency_user_id: agencyUserId,
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
          agency_user_id: (data as any).agency_user_id ?? agencyUserId,

          business_name: (data as any).business_name,
          alternate_name: (data as any).alternate_name || undefined,
          vertical: (data as any).vertical || undefined,

          business_url: (data as any).business_url || undefined,
          logo_url: (data as any).logo_url || undefined,
          short_description: data.short_description || undefined,
          long_description: data.long_description || undefined,
          year_established: (data as any).year_established || undefined,
          team_size: (data as any).team_size || undefined,

          phone: data.phone || undefined,
          email: data.email || undefined,

          services: ((data.services as any[]) || []).map((s: any) => ({
            ...s,
            title: (s?.title ?? s?.name ?? ''),
            name: (s?.name ?? s?.title ?? ''),
          })),
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
          practice_areas: normalizePracticeAreasForUi(((data as any).practice_areas as any[]) || []),
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
        // IMPORTANT: Don't let empty DB arrays overwrite a non-empty local draft (prevents "it saved then disappeared" UX).
        setFormData((prev) => {
          const merged: Partial<ClientProfile> = { ...prev, ...(draft ?? {}), ...fromDb };

          if (((fromDb.practice_areas?.length ?? 0) === 0) && ((draft?.practice_areas?.length ?? 0) > 0)) {
            merged.practice_areas = draft!.practice_areas;
          }
          if (((fromDb.medical_specialties?.length ?? 0) === 0) && ((draft?.medical_specialties?.length ?? 0) > 0)) {
            merged.medical_specialties = draft!.medical_specialties;
          }

          return merged;
        });

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

  const normalizeHttpUrl = (value?: string | null) => {
    const v = (value ?? '').trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };

  // Keep UI inputs friendly (comma-separated strings), but store arrays in the database.
  const normalizeCommaListForUi = (value: any): string => {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    if (typeof value === 'string') return value;
    return '';
  };

  const normalizePracticeAreasForUi = (areas: any[]) =>
    (areas || []).map((pa: any) => ({
      ...pa,
      // Accept either snake_case (preferred) or camelCase (defensive) keys from the backend
      case_types: normalizeCommaListForUi(pa.case_types ?? pa.caseTypes),
      service_areas: normalizeCommaListForUi(pa.service_areas ?? pa.serviceAreas),
    }));

  const buildClientProfileUpsertPayload = () => {
    const businessName = (formData.business_name ?? '').trim() || 'Untitled';

    // Required canonical columns
    const entityId = formData.entity_id ?? crypto.randomUUID();

    return {
      ...(profileId ? { id: profileId } : {}),
      entity_id: entityId,
      owner_user_id: user!.id,
      agency_user_id: agencyUserId,
      business_name: businessName,
      alternate_name: formData.alternate_name || null,

      business_url: formData.business_url || null,
      logo_url: normalizeHttpUrl(formData.logo_url),
      short_description: formData.short_description || null,
      long_description: formData.long_description || null,
      year_established: formData.year_established || null,
      team_size: formData.team_size || null,

      phone: formData.phone || null,
      email: formData.email || null,

      // Vertical
      vertical: formData.vertical || 'general',

      // Offerings by vertical
      services: (formData.services || []).map((s: any) => ({
        ...s,
        title: (s?.title ?? s?.name ?? ''),
        name: (s?.name ?? s?.title ?? ''),
      })),
      // Practice areas: store arrays (and also camelCase aliases) for cross-app compatibility
      practice_areas: (formData.practice_areas || []).map((pa: any) => {
        const caseTypesArr = typeof pa.case_types === 'string'
          ? pa.case_types.split(',').map((s: string) => s.trim()).filter(Boolean)
          : (Array.isArray(pa.case_types) ? pa.case_types : []);

        const serviceAreasArr = typeof pa.service_areas === 'string'
          ? pa.service_areas.split(',').map((s: string) => s.trim()).filter(Boolean)
          : (Array.isArray(pa.service_areas) ? pa.service_areas : []);

        return {
          ...pa,
          case_types: caseTypesArr,
          service_areas: serviceAreasArr,
          // Defensive aliases if the Agency App expects camelCase keys
          caseTypes: caseTypesArr,
          serviceAreas: serviceAreasArr,
        };
      }),
      medical_specialties: (formData.medical_specialties || []).map((ms: any) => ({
        ...ms,
        conditions_treated: typeof ms.conditions_treated === 'string'
          ? ms.conditions_treated.split(',').map((s: string) => s.trim()).filter(Boolean)
          : (ms.conditions_treated || []),
        procedures: typeof ms.procedures === 'string'
          ? ms.procedures.split(',').map((s: string) => s.trim()).filter(Boolean)
          : (ms.procedures || []),
      })),
      products: formData.products || [],

      faqs: formData.faqs || [],
      help_articles: formData.help_articles || [],
      reviews: formData.reviews || [],

      // Credentials
      certifications: formData.certifications || [],
      accreditations: formData.accreditations || [],
      legal_profile: formData.legal_profile || null,
      medical_profile: formData.medical_profile || null,

      // Merge phone + email into locations[0] for Agency App compatibility
      locations: (() => {
        const locs = formData.locations || [];
        if (locs.length === 0) {
          // If no locations but we have phone/email, create a primary location
          if (formData.phone || formData.email) {
            return [{
              location_id: crypto.randomUUID(),
              location_name: 'Primary Location',
              street: '',
              city: '',
              state: '',
              postal_code: '',
              phone: formData.phone || '',
              email: formData.email || '',
              hours: '',
            }];
          }
          return [];
        }
        // Merge phone/email into first location
        return locs.map((loc: any, idx: number) => 
          idx === 0 
            ? { ...loc, phone: formData.phone || loc.phone || '', email: formData.email || loc.email || '' }
            : loc
        );
      })(),
      team_members: formData.team_members || [],
      awards: formData.awards || [],
      media_mentions: formData.media_mentions || [],
      case_studies: formData.case_studies || [],
      
      // Entity linking URLs
      google_business_url: formData.google_business_url || null,
      google_maps_url: formData.google_maps_url || null,
      yelp_url: formData.yelp_url || null,
      bbb_url: formData.bbb_url || null,
      apple_maps_url: formData.apple_maps_url || null,
      linkedin_url: formData.linkedin_url || null,
      facebook_url: formData.facebook_url || null,
      instagram_url: formData.instagram_url || null,
      youtube_url: formData.youtube_url || null,
      twitter_url: formData.twitter_url || null,
      tiktok_url: formData.tiktok_url || null,
      pinterest_url: formData.pinterest_url || null,
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

    console.log("[client_profile] save: payload keys", Object.keys(profilePayload));
    console.log("[client_profile] save: credentials counts", {
      certifications: Array.isArray((profilePayload as any).certifications)
        ? (profilePayload as any).certifications.length
        : "(missing)",
      accreditations: Array.isArray((profilePayload as any).accreditations)
        ? (profilePayload as any).accreditations.length
        : "(missing)",
    });

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

    // Read-after-write verification (helps catch backend mismatch silently dropping fields)
    if (result.entity_id) {
      const { data: verifyRow, error: verifyError } = await supabase
        .from('client_profile')
        .select(
          'certifications, accreditations, practice_areas, medical_specialties, google_business_url, google_maps_url, yelp_url, bbb_url, apple_maps_url, linkedin_url, facebook_url, instagram_url, youtube_url, twitter_url, tiktok_url, pinterest_url, other_profiles'
        )
        .eq('entity_id', result.entity_id)
        .maybeSingle();

      if (verifyError) {
        console.warn('[client_profile] verify after save failed', verifyError);

        const msg = (verifyError as any)?.message ? String((verifyError as any).message) : '';
        const looksLikeMissingColumn =
          /column .* does not exist/i.test(msg) ||
          /could not find the '.*' column/i.test(msg) ||
          /unknown column/i.test(msg);

        if (looksLikeMissingColumn) {
          toast({
            title: 'Saved, but fields did not persist',
            description:
              'Your backend does not appear to have one or more required columns on client_profile (e.g., practice_areas / medical_specialties). Add them as JSONB columns with default [] so the app can store this data.',
            variant: 'destructive',
          });
          return;
        }
      } else if (verifyRow) {
        const savedCertifications = ((verifyRow as any).certifications as any[]) || [];
        const savedAccreditations = ((verifyRow as any).accreditations as any[]) || [];
        const savedPracticeAreas = ((verifyRow as any).practice_areas as any[]) || [];
        const savedMedicalSpecialties = ((verifyRow as any).medical_specialties as any[]) || [];

        // Sync local state to what is actually stored
        setFormDataInternal((prev) => ({
          ...prev,
          entity_id: result.entity_id,
          certifications: savedCertifications,
          accreditations: savedAccreditations,
          practice_areas: normalizePracticeAreasForUi(savedPracticeAreas),
          medical_specialties: savedMedicalSpecialties,

          google_business_url: (verifyRow as any).google_business_url ?? undefined,
          google_maps_url: (verifyRow as any).google_maps_url ?? undefined,
          yelp_url: (verifyRow as any).yelp_url ?? undefined,
          bbb_url: (verifyRow as any).bbb_url ?? undefined,
          apple_maps_url: (verifyRow as any).apple_maps_url ?? undefined,
          linkedin_url: (verifyRow as any).linkedin_url ?? undefined,
          facebook_url: (verifyRow as any).facebook_url ?? undefined,
          instagram_url: (verifyRow as any).instagram_url ?? undefined,
          youtube_url: (verifyRow as any).youtube_url ?? undefined,
          twitter_url: (verifyRow as any).twitter_url ?? undefined,
          tiktok_url: (verifyRow as any).tiktok_url ?? undefined,
          pinterest_url: (verifyRow as any).pinterest_url ?? undefined,
          other_profiles: ((verifyRow as any).other_profiles as any[]) || [],
        }));

        // If the user attempted to save vertical arrays or links but backend returned empty/null, warn loudly.
        const missingAfterSave: string[] = [];

        const intendedPracticeAreas = Array.isArray((profilePayload as any).practice_areas)
          ? ((profilePayload as any).practice_areas as any[]).length
          : 0;
        const intendedMedicalSpecialties = Array.isArray((profilePayload as any).medical_specialties)
          ? ((profilePayload as any).medical_specialties as any[]).length
          : 0;

        if (intendedPracticeAreas > 0 && savedPracticeAreas.length === 0) {
          missingAfterSave.push('practice_areas');
        }
        if (intendedMedicalSpecialties > 0 && savedMedicalSpecialties.length === 0) {
          missingAfterSave.push('medical_specialties');
        }

        const attemptedLinkKeys = [
          'google_business_url',
          'google_maps_url',
          'yelp_url',
          'bbb_url',
          'apple_maps_url',
          'linkedin_url',
          'facebook_url',
          'instagram_url',
          'youtube_url',
          'twitter_url',
          'tiktok_url',
          'pinterest_url',
        ] as const;

        for (const k of attemptedLinkKeys) {
          const intended = (profilePayload as any)[k];
          const stored = (verifyRow as any)[k];
          if (Boolean(intended) && !stored) missingAfterSave.push(k);
        }

        if (missingAfterSave.length > 0) {
          toast({
            title: 'Fields did not persist',
            description: `Saved, but these came back empty from the database: ${missingAfterSave.join(
              ', '
            )}. This usually means the backend table is missing these columns or is blocking updates.`,
            variant: 'destructive',
          });
          return;
        }
      }
    }

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
    team: 'Associates',
    entity_linking: 'Entity Linking',
    credentials: 'Credentials',
    services: 'Services',
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
              {currentStep === 'team' && <TeamStep teamMembers={formData.team_members || []} onChange={(t) => updateFormData({ team_members: t })} />}
              {currentStep === 'entity_linking' && <EntityLinkingStep data={formData} onChange={updateFormData} />}
              {currentStep === 'credentials' && <CredentialsStep data={formData} onChange={updateFormData} />}
              {currentStep === 'services' && <ServicesStep services={formData.services || []} onChange={(s) => updateFormData({ services: s })} />}
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
