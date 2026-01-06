// Service (expertise_name sheet - Page 3)
export interface Service {
  service_id?: string;
  expertise_name: string;  // XLSX: expertise_name
  description: string;
}

// Product (not in XLSX Business template - Business vertical only)
export interface Product {
  product_id?: string;
  name: string;
  short_description: string;
  description: string;
  features: string[];
  sku: string;
  brand: string;
}

// FAQ (Page 9)
export interface FAQ {
  question: string;
  answer: string;
  url?: string;  // XLSX uses url, not slug
}

// Article (Page 10)
export interface Article {
  article_id?: string;
  title: string;
  article_type: string;
  article_content: string;  // XLSX: article_content (not article)
  published_date: string;
  url: string;
  keywords: string;
  slug: string;
}

// Review (Page 11)
export interface Review {
  review_title: string;
  date: string;
  rating: number;
  review: string;  // XLSX: review (not review_body)
}

// Location (Page 2)
export interface Location {
  location_name: string;
  phone: string;
  email?: string;  // XLSX has email
  address_street: string;  // XLSX uses address_street
  address_city: string;
  address_state: string;
  address_postal: string;  // XLSX: address_postal (not postal_code)
  service_areas?: string;  // XLSX has service_areas
  open_hours: string;  // XLSX: open_hours (not hours)
  gmb_url?: string;  // XLSX has gmb_url per location
}

// TeamMember (Page 6 - General Business)
export interface TeamMember {
  full_name: string;  // XLSX: full_name (not member_name)
  role_title: string;  // XLSX: role_title (not role)
  linkedin_url?: string;
  photo_url?: string;
  license_number?: string;
  npi_number?: string;
  bar_number?: string;
  profile_links?: string;  // XLSX has profile_links
  certifications?: string;  // XLSX has certifications
  areas_of_expertise?: string;  // XLSX: areas_of_expertise
  bio: string;
}

// Award (Page 14)
export interface Award {
  award_name: string;  // XLSX: award_name (not name)
  issuer: string;
  date: string;  // XLSX: date (not date_awarded)
  url?: string;  // XLSX: url (not award_url)
}

// MediaMention (Page 13)
export interface MediaMention {
  title: string;
  publication: string;  // XLSX: publication (singular)
  date: string;
  url?: string;
}

// CaseStudy (Page 12)
export interface CaseStudy {
  title: string;
  summary: string;
  outcome: string;  // XLSX: outcome (not outcome_metrics)
}

export interface Certification {
  name: string;
  issuing_body: string;
  date_obtained?: string;
  expiration_date?: string;
  credential_id?: string;
}

export interface Accreditation {
  name: string;
  accrediting_body: string;
  date_obtained?: string;
  expiration_date?: string;
}

export interface InsuranceAccepted {
  name: string;
  plan_types?: string;
}

// Legal Practice Area for vertical === 'legal'
export interface PracticeArea {
  practice_area_id: string;
  name: string;
  case_types: string;
  jurisdiction: string;
  service_areas: string;
  description: string;
  featured: boolean;
}

// Legal profile for credentials only (no practice_areas - stored at top level)
export interface LegalProfile {
  bar_numbers?: string[];
  jurisdictions?: string[];
  court_admissions?: string[];
}

// Medical Specialty for vertical === 'medical' - stored at top level
export interface MedicalSpecialty {
  specialty_id: string;
  name: string;
  conditions_treated: string;
  procedures_offered: string;
  patient_population: string;
  description: string;
  featured: boolean;
}

// Medical profile for credentials only (no specialties - stored at top level)
export interface MedicalProfile {
  npi_number?: string;
  medical_license?: string;
  hospital_affiliations?: string[];
  board_certifications?: string[];
  accepting_new_patients?: boolean;
  telehealth_available?: boolean;
}

export type BusinessVertical = 'general' | 'legal' | 'medical';

export interface ClientProfile {
  id?: string;
  entity_id: string;
  owner_user_id: string;
  agency_user_id: string;
  // Page 1 - Organization fields (XLSX alignment)
  business_name: string;
  main_website_url?: string;  // XLSX: main_website_url
  logo_url?: string;  // XLSX has logo_url
  year_established?: number;  // XLSX: year_established (maps to founding_year in DB)
  team_size?: number;
  short_description?: string;
  long_description?: string;
  category?: string;  // XLSX has category
  // Entity Linking URLs (XLSX Page 1)
  google_business_url?: string;  // XLSX: google_business_url
  google_maps_url?: string;  // XLSX has google_maps_url
  apple_maps_url?: string;
  yelp_url?: string;
  bbb_url?: string;
  linkedin_url?: string;  // XLSX has linkedin_url
  facebook_url?: string;  // XLSX has facebook_url
  instagram_url?: string;  // XLSX has instagram_url
  youtube_url?: string;  // XLSX has youtube_url
  twitter_url?: string;  // XLSX has twitter_url
  tiktok_url?: string;
  pinterest_url?: string;
  other_profiles?: string;  // XLSX: other_profiles
  // Contact info
  primary_phone?: string;  // XLSX: primary_phone
  primary_email?: string;  // XLSX: primary_email
  open_hours?: string;  // XLSX: open_hours
  service_areas?: string;  // XLSX: service_areas
  // JSONB arrays
  services?: Service[];  // business only (expertise)
  products?: Product[];
  faqs?: FAQ[];
  articles?: Article[];
  reviews?: Review[];
  locations?: Location[];
  team_members?: TeamMember[];
  awards?: Award[];
  media_mentions?: MediaMention[];
  case_studies?: CaseStudy[];
  created_at?: string;
  updated_at?: string;
  // Core fields
  vertical?: BusinessVertical;
  certifications?: Certification[];
  accreditations?: Accreditation[];
  insurance_accepted?: InsuranceAccepted[];
  // Top-level vertical-specific arrays (per canonical rules)
  practice_areas?: PracticeArea[];  // legal only
  medical_specialties?: MedicalSpecialty[];  // medical only
  // Vertical-specific profiles (credentials only, no arrays)
  legal_profile?: LegalProfile;
  medical_profile?: MedicalProfile;
}

export type FormStep = 
  | 'entity'
  | 'credentials'
  | 'services'
  | 'products'
  | 'faqs'
  | 'articles'
  | 'reviews'
  | 'locations'
  | 'team'
  | 'awards'
  | 'media'
  | 'cases'
  | 'review';
