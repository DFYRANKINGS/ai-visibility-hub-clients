export interface Service {
  service_id: string;
  title: string;
  category: string;
  description: string;
  price_range: string;
  slug: string;
  featured: boolean;
  license_number?: string;
  bar_number?: string;
  npi_number?: string;
  certification_body?: string;
  service_area_radius_miles?: number;
}

export interface Product {
  product_id: string;
  name: string;
  short_description: string;
  description: string;
  price: number;
  features: string[];
  sku: string;
  brand: string;
  offers_price_currency: string;
}

export interface FAQ {
  keywords: string;
  question: string;
  answer: string;
  slug: string;
}

export interface Article {
  article_id: string;
  title: string;
  article_type: string;
  article: string;
  published_date: string;
  url: string;
  keywords: string;
  slug: string;
}

export interface Review {
  customer_name: string;
  review_title: string;
  review_body: string;
  rating: number;
  date: string;
  reviewer_profession?: string;
}

export interface Location {
  location_id: string;
  location_name: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  phone: string;
  hours: string;
  geo_latitude?: number;
  geo_longitude?: number;
}

export interface TeamMember {
  member_name: string;
  role: string;
  bio: string;
  linkedin_url?: string;
  photo_url?: string;
  license_number?: string;
  npi_number?: string;
  bar_number?: string;
}

export interface Award {
  name: string;
  issuer: string;
  date_awarded: string;
  award_url?: string;
}

export interface MediaMention {
  title: string;
  publications: string;
  date: string;
  url?: string;
  mention_type: string;
}

export interface CaseStudy {
  case_id: string;
  title: string;
  summary: string;
  outcome_metrics: string;
}

export interface ClientProfile {
  id?: string;
  owner_user_id: string;
  entity_name: string;
  legal_name?: string;
  main_website_url?: string;
  short_description?: string;
  long_description?: string;
  hours?: string;
  founding_year?: number;
  team_size?: number;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_postal_code?: string;
  phone?: string;
  email?: string;
  same_as?: string[];
  services?: Service[];
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
}

export type FormStep = 
  | 'entity'
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
