// Service (business vertical - expertise/services)
export interface Service {
  service_id?: string;
  title?: string;
  name?: string;
  description: string;
  category?: string;
  slug?: string;
  featured?: boolean;
}

// FAQ
export interface FAQ {
  question: string;
  answer: string;
  keywords?: string;
  slug?: string;
}

// Help Article (help_articles column)
export interface HelpArticle {
  article_id?: string;
  title: string;
  article_type?: string;
  article_content?: string;
  published_date?: string;
  url?: string;
  keywords?: string;
  slug?: string;
}

// Review
export interface Review {
  customer_name?: string;
  review_title?: string;
  review_body?: string;
  rating?: number;
  date?: string;
  reviewer_profession?: string;
}

// Location (stored in locations JSONB array)
export interface Location {
  location_id?: string;
  location_name?: string;
  name?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  phone?: string;
  email?: string;
  hours?: string;
  service_areas?: string;
}

// TeamMember (team_members column - label changes per vertical but same DB column)
export interface TeamMemberProfileUrl {
  platform?: string;
  url: string;
}

export interface TeamMemberCertification {
  name: string;
  issuing_body?: string;
  date_obtained?: string;
}

export interface TeamMember {
  member_name?: string;
  name?: string;
  role?: string;
  title?: string;
  bio?: string;
  license_number?: string;       // business vertical only
  license_issuer?: string;       // business vertical only
  linkedin_url?: string;
  photo_url?: string;
  npi_number?: string;
  bar_number?: string;
  specialties?: string[];
  profile_urls?: TeamMemberProfileUrl[];
  certifications?: TeamMemberCertification[];
}

// Award
export interface Award {
  name?: string;
  issuer?: string;
  date_awarded?: string;
  award_url?: string;
}

// MediaMention
export interface MediaMention {
  title?: string;
  publications?: string;
  date?: string;
  url?: string;
  mention_type?: string;
}

// CaseStudy
export interface CaseStudy {
  case_id?: string;
  title?: string;
  summary?: string;
  outcome_metrics?: string;
}

export interface Certification {
  name: string;
  issuing_body?: string;
  date_obtained?: string;
  expiration_date?: string;
  credential_id?: string;
}

export interface Accreditation {
  name: string;
  organization?: string;
  date_obtained?: string;
  url?: string;
}

// Legal Practice Area for vertical === 'legal'
export interface PracticeArea {
  practice_area_id?: string;
  name: string;
  case_types?: string;
  jurisdiction?: string;
  service_areas?: string;
  description?: string;
  featured?: boolean;
}

// Legal profile for credentials only
export interface LegalProfile {
  bar_numbers?: string[];
  jurisdictions?: string[];
  court_admissions?: string[];
}

// Medical Specialty for vertical === 'medical'
export interface MedicalSpecialty {
  specialty_id?: string;
  name: string;
  conditions_treated?: string;
  procedures_offered?: string;
  patient_population?: string;
  description?: string;
  featured?: boolean;
}

// Medical profile for credentials only
export interface MedicalProfile {
  npi_number?: string;
  medical_license?: string;
  hospital_affiliations?: string[];
  board_certifications?: string[];
  accepting_new_patients?: boolean;
  telehealth_available?: boolean;
}

// OtherProfile for other_profiles JSONB array
export interface OtherProfile {
  platform?: string;
  url: string;
}

export type BusinessVertical = 'general' | 'legal' | 'medical';

export interface ClientProfile {
  id?: string;
  entity_id: string;
  owner_user_id: string;
  agency_user_id: string;
  
  // Core business info (DB columns)
  business_name: string;
  alternate_name?: string;
  vertical?: BusinessVertical;
  category?: string;
  business_url?: string;
  logo_url?: string;
  short_description?: string;
  long_description?: string;
  year_established?: number;
  team_size?: number;
  
  // Contact
  phone?: string;
  email?: string;
  
  // Locations JSONB array
  locations?: Location[];
  
  // Social/Entity linking URLs
  google_business_url?: string;
  google_maps_url?: string;
  yelp_url?: string;
  bbb_url?: string;
  apple_maps_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  pinterest_url?: string;
  other_profiles?: OtherProfile[];
  
  // Team members JSONB array (label varies by vertical)
  team_members?: TeamMember[];
  
  // Credentials
  certifications?: Certification[];
  accreditations?: Accreditation[];
  legal_profile?: LegalProfile;
  medical_profile?: MedicalProfile;
  
  // Offerings by vertical
  services?: Service[];  // business vertical only
  practice_areas?: PracticeArea[];  // legal vertical only
  medical_specialties?: MedicalSpecialty[];  // medical vertical only
  
  // Content JSONB arrays
  faqs?: FAQ[];
  help_articles?: HelpArticle[];  // renamed from articles
  reviews?: Review[];
  case_studies?: CaseStudy[];
  media_mentions?: MediaMention[];
  awards?: Award[];
  
  created_at?: string;
  updated_at?: string;
}

export type FormStep = 
  | 'entity'           // Organization (includes locations)
  | 'team'             // Team members (Associates/Lawyers/Providers)
  | 'entity_linking'   // External profiles & links
  | 'credentials'
  | 'services'
  | 'faqs'
  | 'help_articles'
  | 'reviews'
  | 'awards'
  | 'media'
  | 'cases'
  | 'review';
