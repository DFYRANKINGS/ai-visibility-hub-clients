// clientProfileColumns.ts
// Canonical whitelist of allowed DB columns for client_profile table
// Keep this in sync with the actual Supabase schema
export const CLIENT_PROFILE_COLUMNS = new Set([
  // Identity & ownership
  'entity_id',
  'owner_user_id',
  'agency_user_id',
  'vertical',

  // Core business info
  'business_name',
  'alternate_name',
  'legal_name',
  'business_url',
  'logo_url',
  'short_description',
  'long_description',
  'category',
  'year_established',
  'team_size',

  // Contact
  'phone',
  'email',
  'address_street',
  'address_city',
  'address_state',
  'address_postal_code',
  'hours',

  // JSONB arrays - locations & team
  'locations',
  'team_members',

  // Credentials
  'license_number',
  'certifications',
  'accreditations',
  'insurance_accepted',
  'legal_profile',
  'medical_profile',

  // Offerings by vertical
  'services',
  'products',
  'practice_areas',
  'medical_specialties',

  // Content JSONB arrays
  'reviews',
  'case_studies',
  'media_mentions',
  'awards',
  'faqs',
  'help_articles',
  'articles',

  // Authority / social profiles
  'linkedin_profile',
  'facebook_profile',
  'instagram_profile',
  'youtube_profile',
  'twitter_profile',
  'tiktok_profile',
  'pinterest_profile',
  'yelp_profile',
  'bbb_profile',
  'google_business_url',
  'apple_maps_url',
  'other_profiles'
]);
